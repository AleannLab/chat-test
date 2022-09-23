import React from 'react';
import { fetchVoip } from 'helpers/fetch';
import { useInfiniteQuery, useQuery } from 'react-query';
import { queryClient } from 'App';
import { useStores } from 'hooks/useStores';

export const useLoadPatientFeed = () => {
  const { patientsFeed, notification } = useStores();

  const result = useInfiniteQuery(
    ['patientFeed', patientsFeed.patientSearch, patientsFeed.smsUnseenOnly],
    async ({ pageParam }) => {
      const params = {
        ...pageParam,
        rows: patientsFeed.NUM_RECORDS,
        unseenOnly: patientsFeed.smsUnseenOnly,
        noEmail: true,
        includeDependents: true,
        onlyGuarantors: true,
      };

      if (patientsFeed.patientSearch) {
        params.search = patientsFeed.patientSearch;
        params.includeDependents = false;
        params.onlyGuarantors = false;
      }

      return await patientsFeed.listApiHandler(params);
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage[0]) {
          return {
            offset: pages.length * patientsFeed.NUM_RECORDS,
          };
        } else return undefined;
      },
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to fetch the patient feed',
        ),
      onSuccess: (data) => onFeedLoadSuccess({ data, patientsFeed }),
    },
  );

  result.isRefetching = patientsFeed.isRefetching;
  return result;
};

export const useUnseenCounts = (pagedPatients) => {
  const { patientChats } = useStores();

  const query = useQuery(
    [patientChats.queryKeys.unseenTextMessageCountByPhoneNumbers],
    () => ({}),
  );

  // reload unseen counts when pagedPatients changes, save data to react-query store
  React.useEffect(() => {
    if (!pagedPatients) return;

    const numbersMap = {};
    const requested = queryClient.getQueryData([
      patientChats.queryKeys.unseenTextMessageCountByPhoneNumbers,
    ]);
    pagedPatients.pages.forEach((page) =>
      page.forEach(({ phone_no }) => {
        if (phone_no !== null && requested[phone_no] === undefined)
          numbersMap[phone_no] = true;
      }),
    );

    const numbers = Object.keys(numbersMap);
    if (numbers.length === 0) return;

    fetchVoip('/text-messages/unseen-counts', {
      query: { phone_numbers: numbers.join(',') },
    }).then((rows) => {
      const newData = {};
      rows.forEach(({ did, count }) => (newData[did] = count));

      // in case if server responded with fewer numbers than requested
      numbers.forEach((number) => {
        newData[number] = newData[number] || 0;
      });

      queryClient.setQueryData(
        [patientChats.queryKeys.unseenTextMessageCountByPhoneNumbers],
        (data = {}) => ({ ...data, ...newData }),
      );
    });
  }, [pagedPatients, query.data]); // eslint-disable-line react-hooks/exhaustive-deps

  return query;
};

export const selectedCardRef = { current: null };
let selectedPosition = null;

export const onFeedLoadSuccess = ({ data, patientsFeed }) => {
  if (data.pages[0].length > 0 && patientsFeed.patientSearch === '') {
    let patient = data.pages[0][0];
    if (!patient.firstname && !patient.lastname) {
      patient.displayName = null;
    } else {
      patient.displayName =
        data.pages[0][0].firstname + ' ' + data.pages[0][0].lastname;
    }

    /*
     selected patient has only id when coming from lobby, need to set full record

     Currently commented out to satisfy KAS-3329
     */
    /*
    if (!patientsFeed.selectedPatient) {
      patientsFeed.setSelectedPatient(patient);
    }
    */
  }

  const selectedCard = selectedCardRef.current;
  selectedPosition = selectedCard ? selectedCard.offsetTop : null;
};

export const restoreSelectedPosition = (scrollingElement) => {
  const selectedCard = selectedCardRef.current;
  if (selectedPosition !== null && selectedCard) {
    scrollingElement.scrollTop += selectedCard.offsetTop - selectedPosition;
  }
};

export const openPatientChat = ({
  patientName,
  patientId,
  patientsFeed,
  history,
}) => {
  patientsFeed.setPatientSearch(patientName);
  patientsFeed.setSelectedPatient({
    id: patientId,
  });
  history.push('/dashboard/patient-feed');
};
