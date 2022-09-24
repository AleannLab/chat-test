import Resource from './utils/resource';
import { groupBy as _groupby } from 'lodash';
import CONSTANTS from 'helpers/constants';
import { serializeToQueryString } from 'helpers/misc';
import { queryClient } from 'App';
import { convertCustomTime } from 'helpers/timezone';
import { eventInitiatorId } from 'helpers/firebase';

export class PatientChat extends Resource {
  queryKeys = {
    unseenTextMessageCountByPhoneNumbers:
      'voip-unseen-text-message-count-by-phone-numbers',
  };

  constructor(store) {
    super(store);
    this.activityLogStore = store.activityLogs;
    this.stores = store;
  }

  getSortedChats = (data, sortOrder = 'asc') => {
    if (sortOrder === 'asc') {
      // Returns chats in ascending order
      return data.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
    } else {
      // Returns chats in descending order
      return data.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
    }
  };

  async listApiHandler(params) {
    const response = await this.fetch(
      `${CONSTANTS.VOIP_API_URL}/text-messages${serializeToQueryString(
        params,
      )}`,
    )
      .then((r) => r.json())
      .then((results) =>
        results.map((result) => ({ ...result, id: result.uuid })),
      )
      .catch((err) => {
        console.error(err);
        throw Error(
          'An unexpected error occurred while attempting to fetch the text messages',
        );
      });

    // if (response) {
    //   const lastMessage = response[response.length - 1];
    //   if (lastMessage) {
    //     this.fetch(`${CONSTANTS.VOIP_API_URL}/text-messages/seen`, {
    //       method: 'PUT',
    //       body: JSON.stringify({
    //         older_than_uuid: lastMessage.uuid,
    //         event_initiator_id: eventInitiatorId,
    //       }),
    //     })
    //       .then((response) => response.json())
    //       .then((data) => {
    //         if (data.from_did && data.updated_count) {
    //           this.addToUnseenCount({
    //             fromDid: data.from_did,
    //             textMessagesCount: -data.updated_count,
    //           });
    //         }
    //       });
    //   }
    // }

    return response;
  }

  async markTextsAsUnseen({ from_did }) {
    if (from_did) {
      this.fetch(`${CONSTANTS.VOIP_API_URL}/text-messages/seen`, {
        method: 'PUT',
        body: JSON.stringify({
          from_did,
          event_initiator_id: eventInitiatorId,
        }),
      });
    }
  }

  async martMessageAsUnread(did) {
    this.fetch(`${CONSTANTS.VOIP_API_URL}/text-messages/${did}/unseen`, {
      method: 'PATCH',
    });
  }

  async _createChatApiHandler({ message, toDid, ref }) {
    return this.fetch(`${CONSTANTS.VOIP_API_URL}/text-messages`, {
      method: 'POST',
      body: JSON.stringify({ text: message, to_did: toDid, ui_ref: ref }),
    }).then((response) => response.json());
  }

  formattedMessages(chats, showDate) {
    let combinationId = 0;
    const chatsToProcess = chats;
    let dateCounter = convertCustomTime({
      dateTime: chatsToProcess[0].datetime,
      shouldFormat: false,
    }).startOf('day');
    let formattedChat = [];
    chatsToProcess.forEach((chat, index) => {
      const previousChat = chatsToProcess[index - 1];

      if (!chat) return;
      if (index === 0) {
        if (showDate) {
          formattedChat.push({
            type: 'DATE',
            date: convertCustomTime({
              dateTime: chat.datetime,
              shouldFormat: false,
            }),
            combinationId,
          });
          combinationId += 1;
        }
        return formattedChat.push({
          type: 'CHAT',
          ...chat,
          combinationId,
        });
      }

      if (
        !convertCustomTime({ dateTime: chat.datetime, shouldFormat: false })
          .startOf('day')
          .isSame(dateCounter)
      ) {
        combinationId = combinationId + 1;
        formattedChat.push({
          type: 'DATE',
          date: convertCustomTime({
            dateTime: chat.datetime,
            shouldFormat: false,
          }),
          combinationId,
        });
        combinationId = combinationId + 1;
        dateCounter = convertCustomTime({
          dateTime: chat.datetime,
          shouldFormat: false,
        }).startOf('day');
      }

      if (
        chat.username !== previousChat.username ||
        convertCustomTime({
          dateTime: chat.datetime,
          shouldFormat: false,
        }).diff(previousChat.datetime, 'minutes') > 1 ||
        previousChat.direction !== chat.direction
      ) {
        combinationId = combinationId + 1;
      }

      formattedChat.push({
        type: 'CHAT',
        ...chat,
        combinationId,
      });
    });

    return Object.values(_groupby(formattedChat, 'combinationId'));
  }

  async appendMessageOrDiscard(message, patientDid) {
    const { status } = message;

    // if (status === 'received') {
    //   this.addToUnseenCount({ fromDid: patientDid });
    // }

    if (status === 'received' || status === 'delivered') {
      this.stores.patientsFeed.refetchPatientFeed();
    }

    this.stores.patientsFeed.selectedPatient &&
      this.stores.patientsFeed.selectedPatient.phone_no &&
      (await queryClient.refetchQueries([
        'patient-chat',
        this.stores.patientsFeed.selectedPatient.phone_no,
      ]));
  }

  handleSeenEvent({ from_did }) {
    this.addToUnseenCount({ fromDid: from_did });
  }

  updateGlobalUnseenCounts(unseenCounts) {
    queryClient.setQueryData(
      [this.activityLogStore.queryKeys.unseenCounts],
      (_) => ({ data: unseenCounts }),
    );
  }

  updateDidUnseenCounts({ fromDid, newCount }) {
    queryClient.setQueryData(
      [this.queryKeys.unseenTextMessageCountByPhoneNumbers],
      (data = {}) => ({ ...data, [fromDid]: newCount }),
    );
  }

  addToUnseenCount({ fromDid, textMessagesCount }) {
    // if (textMessagesCount !== undefined) {
    //   queryClient.setQueryData(
    //     [this.activityLogStore.queryKeys.unseenCounts],
    //     (data = {}) => ({
    //       ...data,
    //       text_messages_unseen_count:
    //         (data.text_messages_unseen_count || 0) + textMessagesCount,
    //     }),
    //   );
    //   queryClient.setQueryData(
    //     [this.queryKeys.unseenTextMessageCountByPhoneNumbers],
    //     (data = {}) => {
    //       const newCount = (data[fromDid] || 0) + textMessagesCount;
    //       return { ...data, [fromDid]: newCount > 0 ? newCount : 0 };
    //     },
    //   );
    // } else {
    //   queryClient.invalidateQueries([
    //     this.activityLogStore.queryKeys.unseenCounts,
    //   ]);
    //   queryClient.setQueryData(
    //     [this.queryKeys.unseenTextMessageCountByPhoneNumbers],
    //     (data = {}) => {
    //       return { ...data, [fromDid]: undefined };
    //     },
    //   );
    // }
  }
}
