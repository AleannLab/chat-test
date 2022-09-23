import React, { useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import LinearProgress from '@material-ui/core/LinearProgress';
import { observer } from 'mobx-react';

import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const TaskCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState({
    id: 'all_categories',
    name: 'All Categories',
  });
  const { tasks } = useStores();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category.name === 'All Categories') {
      tasks.currentlySelectedTaskCategory = null;
      tasks.detailedTaskInfo = null;
      tasks.currentlySelectedTaskForInfo = null;
    } else {
      tasks.currentlySelectedTaskCategory = category;
    }
  };

  const getCategories = () => {
    const tempCategories = [];

    tasks.data.forEach((id) => {
      const taskData = tasks.get([{ categories: [] }, id]);
      taskData.categories.forEach((category) => {
        let categoryObj = {};
        categoryObj.name = category.name;
        categoryObj.id = category.id;
        if (tempCategories.length === 0) {
          categoryObj.count = 1;
          tempCategories.push(categoryObj);
        } else {
          let count = 0;
          tempCategories.forEach((tempCategory) => {
            if (tempCategory.name === category.name) {
              tempCategory.count = tempCategory.count + 1;
            } else {
              count += 1;
            }
          });
          if (count === tempCategories.length) {
            categoryObj.count = 1;
            tempCategories.push(categoryObj);
          }
        }
      });
    });
    tempCategories.unshift({
      id: 'all_categories',
      name: 'All Categories',
      count: tasks.data.length,
    });
    return tempCategories;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.headerText}>Tasks</div>
      </div>
      <div className={styles.subHeaderContainer}>
        <div className={styles.subHeaderText}>Categories</div>
      </div>
      <Scrollbars renderTrackHorizontal={(props) => <div {...props} />}>
        <div className={styles.categoryContainer}>
          {tasks.loading && <LinearProgress />}
          {getCategories().map((category) => (
            <div
              key={category.id}
              className={`${styles.category} ${
                selectedCategory.id === category.id
                  ? styles.selectedCategory
                  : ''
              }`}
              onClick={() => handleCategorySelect(category)}
            >
              <div
                className={
                  category.name === 'All Categories'
                    ? styles.allCategoriesText
                    : styles.categoryText
                }
              >
                {category.name}
              </div>
              <div className={styles.count}>({category.count})</div>
            </div>
          ))}
        </div>
      </Scrollbars>
    </div>
  );
};

export default observer(TaskCategories);
