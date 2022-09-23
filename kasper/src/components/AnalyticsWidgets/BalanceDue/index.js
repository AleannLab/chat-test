import React, { useState } from 'react';
import styles from './index.module.css';
import Skeleton from '@material-ui/lab/Skeleton';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import { convertToCurrency } from 'helpers/misc';

const BalanceDue = () => {
  const { analytics: analyticsStore } = useStores();
  const [data, setData] = useState();

  // react-query to fetch analytics for total patients scheduled
  const balanceDueQuery = useQuery(
    'balanceDue',
    () => analyticsStore.getBalanceDue(),
    {
      onSuccess: (response) => {
        setData(response);
      },
    },
  );

  return (
    <div className={styles.container}>
      {!!data && !balanceDueQuery.isFetching ? (
        <>
          <span className={styles.title}>Balance due for these patients</span>
          <div className={styles.amountContainer}>
            <span className={styles.amount}>
              {convertToCurrency(data.total)}
            </span>
            <span className={styles.days}>over 30 days</span>
          </div>
        </>
      ) : (
        <div>
          <Skeleton variant="text" height={20} />
          <Skeleton className="mt-2" variant="text" height={30} width={100} />
        </div>
      )}
    </div>
  );
};

export default BalanceDue;
