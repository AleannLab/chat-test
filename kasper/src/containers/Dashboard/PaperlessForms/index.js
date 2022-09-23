import React, { useEffect } from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import PaperlessFormGroups from 'components/PaperlessFormGroups';
import PaperlessFormSections from 'components/PaperlessFormSections';
import PaperlessFormPreview from 'components/PaperlessFormPreview';
import { Route, useRouteMatch } from 'react-router-dom';
import AddNewGroup from 'components/PaperlessFormGroups/AddNewGroup';
import AddNewSection from 'components/PaperlessFormSections/AddNewSection';
import RenameGroup from 'components/PaperlessFormGroups/RenameGroup';
import HeadComp from 'components/SEO/HelmetComp';

const PaperlessForms = () => {
  const match = useRouteMatch('/dashboard/paperless-forms');

  return (
    <>
      <HeadComp title="Paperless Forms" />
      <Grid container className={styles.root}>
        <Grid
          item
          xs={6}
          md={3}
          className={styles.paperlessFormSectionContainer}
        >
          <PaperlessFormGroups />
        </Grid>
        <Grid item xs={6} md={3} className={styles.allSectionsContainer}>
          <PaperlessFormSections />
        </Grid>
        <Grid item xs={12} md={6} className={styles.previewContainer}>
          <PaperlessFormPreview />
        </Grid>
      </Grid>

      <Route path={`${match.url}/add-new-group`} component={AddNewGroup} />
      <Route
        path={`${match.url}/rename-group/:id/:originalName`}
        component={RenameGroup}
      />
      <Route path={`${match.url}/add-new-section`} component={AddNewSection} />
    </>
  );
};
export default PaperlessForms;
