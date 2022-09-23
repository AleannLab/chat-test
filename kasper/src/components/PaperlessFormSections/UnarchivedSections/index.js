import React, { useEffect, useState, useRef } from 'react';
import Button from '@material-ui/core/Button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Scrollbars } from 'react-custom-scrollbars';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import IconButton from '@material-ui/core/IconButton';
import { observer } from 'mobx-react';
import { Form } from '@formio/react';
import { useStores } from 'hooks/useStores';
import ReactToPrint from 'react-to-print';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { makeStyles } from '@material-ui/styles';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import debounce from 'lodash.debounce';
import PaperlessFormSkeleton from '../PaperlessFormSkeleton';
import Menu from '../Menu';
import AddToGroup from 'components/PaperlessFormSections/AddToGroup';
import SendFormsToPatients from 'components/SendFormsToPatients';
import Checkbox from 'components/Core/Checkbox';
import { ReactComponent as FolderTreeIcon } from 'assets/images/folder-tree.svg';
import { ReactComponent as ArchiveIcon } from 'assets/images/archive.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import PatientFormQueues from 'components/PatientFormQueues';
import AutomationArchiveWarning from '../AutomationArchiveWarning';
import { useFlags } from 'launchdarkly-react-client-sdk';
import styles from './index.module.css';
import Automation from 'components/Automation';
import SettingsIcon from '@material-ui/icons/Settings';
import './printsettings.css';
import { Fade } from '@material-ui/core';
import Modal from 'components/Core/Modal';
import PDFViewer from 'components/Core/PDFViewer';
import { usePermissions } from '../../../hooks/usePermissions';
import { useQuery, useQueryClient } from 'react-query';

const unarchivedMenuItems = [
  { label: 'Add to Group', value: 'Add', icon: <FolderTreeIcon /> },
  {
    label: 'Archive',
    value: 'Archive',
    icon: <ArchiveIcon style={{ fill: '#999999' }} />,
  },
];

const unarchivedNonAllSectionsMenuItems = [
  { label: 'Add to Group', value: 'Add', icon: <FolderTreeIcon /> },
  {
    label: 'Archive',
    value: 'Archive',
    icon: <ArchiveIcon style={{ fill: '#999999' }} />,
  },
  {
    label: 'Remove from Group',
    value: 'Remove',
    icon: <DeleteIcon style={{ fill: '#999999' }} />,
  },
];

const PrintButton = (props) => {
  const { onClick, setIsPrinting } = props;
  const { notification } = useStores();

  const handleClick = () => {
    notification.showInfo('Generating PDF');

    // Currently timeout is required to wait for the refs to get appended
    setTimeout(() => {
      notification.hideNotification();
      onClick();
      setIsPrinting(false);
    }, 1500);
  };

  useEffect(() => {
    handleClick();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <></>;
};

const useStyles = makeStyles({
  patientBtn: {
    '&.MuiButton-root': {
      padding: '5px 1px',
    },
    '&.MuiButton-outlinedSecondary': {
      minWidth: '100%',
    },
  },
  actionBtn: {
    '&.MuiButton-containedSecondary': {
      minWidth: '100%',
      minHeight: '100%',
    },
  },
});
const PaperlessFormSections = () => {
  const [selectedSections, setSelectedSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [curGroup, setCurGroup] = useState();
  const [formSections, setFormSections] = useState([]);
  const [showAddToGroup, setShowAddToGroup] = useState(false);
  const [showSendFormsToPatients, setShowSendFormsToPatients] = useState(false);
  const { formGroups, paperlessForm, notification, paperlessAutomation } =
    useStores();
  const [isPrinting, setIsPrinting] = useState(false);
  const ref = useRef();
  const searchTermRef = useRef();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const queryClient = useQueryClient();
  const [showPatientQueue, setShowPatientQueue] = useState(false);
  const { formAutomation, formsMetaOnly, mergeAndPrint } = useFlags();
  const [showAutomation, setShowAutomation] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showArchiveWarning, setShowArchiveWarning] = useState(false);
  const [showFormKeyAutomationWarning, setShowFormKeyAutomationWarning] =
    useState({});
  const userPermissionsQuery = usePermissions();
  const actionItems = [
    {
      id: 1,
      label: 'Send These to Patient...',
      value: 'send_these_to_patient',
    },
    { id: 2, label: 'Add to Group...', value: 'add_to_group' },
    { id: 3, label: 'Print', value: 'print' },
  ];

  useEffect(() => {
    // Only reset the selections initially
    // Do not reset selected sections, after consent form as been added to selected sections
    if (paperlessForm.selectedSections.length === 0) {
      paperlessForm.resetSelectedSections();
      paperlessForm.setConsentForm();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    paperlessForm.setMetaOnly(formsMetaOnly);
  }, [formsMetaOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (curGroup !== formGroups.selectedGroup.id) {
      setCurGroup(formGroups.selectedGroup.id);

      if (paperlessForm.searchItem) {
        clearSearchField();
      } else {
        refreshSections(false, paperlessForm.searchItem);
      }
    }
  }, [formGroups.selectedGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => {
      refreshSections(true, paperlessForm.searchItem);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paperlessForm.isSectionRemovedFromGroup, paperlessForm.isSectionArchived],
  );

  const { data: AutomationFetchData } = useQuery(
    ['automationFetchData'],
    () => {
      return paperlessAutomation.fetchFormAutomationData();
    },
  );

  async function refreshSections(fetchAllForms = false, searchItemData) {
    // fetchAllForms is used to fetch all the forms after archiving or removing a section from the group
    setLoading(true);

    try {
      setFormSections([]);

      if (formGroups.selectedGroup.id !== 'all_sections') {
        if (fetchAllForms) {
          await paperlessForm.fetchList({
            refreshList: true,
            search: searchItemData,
            metaOnly: true,
          });
        }
        let sections = await _loadSectionsByGroup(formGroups.selectedGroup);
        setFormSections(sections);

        // Change order of selected sections according to the one in current group
        if (paperlessForm.selectedSections.length > 1) {
          paperlessForm.reorderSections({ sections, useIndices: true });
        }
      } else {
        if (searchItemData && searchItemData !== '') {
          await paperlessForm.fetchList({
            refreshList: true,
            search: searchItemData,
          });
        } else {
          await paperlessForm.fetchList();
        }
        setFormSections(
          paperlessForm.getAllSectionsByArchiveStatus({ archived: false }),
        );
        if (paperlessForm.selectedSections.length > 1) {
          paperlessForm.reorderSections({
            sections: paperlessForm.getAllSectionsByArchiveStatus({
              archived: false,
            }),
            useIndices: true,
          });
          let newSelectedSections = [];
          paperlessForm.selectedSections.forEach((section) => {
            if (section.form.formKey !== 'formConsentDisclosure') {
              newSelectedSections.push({
                index: section.index,
                formKey: section.form.formKey,
              });
            }
          });
          setSelectedSections([...newSelectedSections]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function _loadSectionsByGroup(group) {
    try {
      await paperlessForm.fetchSectionsOfSelectedGroup(group);
      return paperlessForm.sectionsByGroupId({
        groupId: group.id,
        archived: false,
      });
    } catch (err) {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the sections',
      );
    }
  }

  useEffect(() => {
    setSelectedSections([]);
    paperlessForm.setIsGroupSent(false);
  }, [paperlessForm.isGroupSent]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectAllSections = () => {
    setSelectedSections([
      ...formSections.map(({ formKey }, index) => {
        return { index, formKey };
      }),
    ]);
    formSections.forEach((form, index) => {
      paperlessForm.selectSection({ form, index });
    });
  };

  const handleUncheckAllSections = () => {
    setSelectedSections([]);
    paperlessForm.resetSelectedSections();
    paperlessForm.setConsentForm();
  };

  const toggleSectionSelection = (form, index) => {
    const newSelectedSections = [...selectedSections];
    let removed = 0;
    newSelectedSections.forEach((section, newIndex) => {
      // Remove the section if it already exists
      if (section.formKey === form.formKey) {
        newSelectedSections.splice(newIndex, 1);
        removed = 1;
      }
    });
    if (removed === 0) {
      newSelectedSections.push({
        index: index,
        formKey: form.formKey,
      });
    }
    paperlessForm.selectSection({ form, index });
    setSelectedSections([...newSelectedSections]);
  };

  const showChecked = (formKey) => {
    const length = paperlessForm.selectedSections.filter((section) => {
      return !!section && section.form.formKey === formKey;
    }).length;
    return length > 0 ? true : false;
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    if (result[endIndex]) {
      result.splice(endIndex, 0, removed);
      return result;
    } else {
      result[endIndex] = removed;
      return [...result];
    }
  };

  const saveReorderedSections = (formKey, newIndex) => {
    if (formGroups.selectedGroup.id !== 'all_sections') {
      paperlessForm.updateReorderedSections(
        formGroups.selectedGroup.id,
        formKey,
        newIndex,
      );
    } else {
      paperlessForm.updateReorderedAllSections(formKey, newIndex);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    setSelectedSections([
      ...reorder(selectedSections, source.index + 1, destination.index + 1),
    ]);
    const selectedSectionsCopy = [...selectedSections];
    selectedSectionsCopy.forEach((section) => {
      if (section.formKey === draggableId) {
        section.index = destination.index;
      } else {
        // Check whether the dragged section is above the other selected section
        // decrement other section's index to position it above the dragged section
        if (
          source.index < section.index &&
          destination.index >= section.index
        ) {
          section.index -= 1;
        } else if (
          source.index > section.index &&
          destination.index <= section.index
        ) {
          // Check whether the dragged section is below the other selected section
          // increment other section's index to position it below the dragged section
          section.index += 1;
        }
      }
    });
    setSelectedSections([...selectedSectionsCopy]);
    const items = reorder(formSections, source.index, destination.index);
    setFormSections([...items]);

    saveReorderedSections(draggableId, destination.index);
    if (formGroups.selectedGroup.id !== 'all_sections') {
      paperlessForm.reorderSections({ sections: items, useIndices: true });
    } else {
      paperlessForm.reorderSections({ sections: selectedSections });
    }
  };

  const refetchAutomationQueryData = async () => {
    await queryClient.invalidateQueries('automationFetchData');
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    // change border if dragging
    background: isDragging ? '#0D2145' : '',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const handleMenuClick = async (e, form) => {
    let removeFromSelection = false;
    // If the section is selected remove it after archiving
    paperlessForm.selectedSections.forEach((selection) => {
      if (selection.form.formKey === form.formKey) {
        removeFromSelection = true;
      }
    });
    if (e === 'Add') {
      paperlessForm.setSectionToGroupAdditionSuccessful(false);
      paperlessForm.setSectionToGroupAdditionUnsuccessful(false);
      paperlessForm.addSectionsToAddToGroups(form.formKey);
      setShowAddToGroup(true);
    } else if (e === 'Archive') {
      try {
        const autoData = () => {
          const resp = {};
          AutomationFetchData.forEach((data) => {
            [...JSON.parse(data.forms)].forEach((listItm) => {
              resp[listItm] = data.patient_type;
            });
          });
          return resp;
        };
        if (Object.keys(autoData()).includes(form.formKey)) {
          setShowFormKeyAutomationWarning({
            formKey: form.formKey,
            formName: form.name.trim(),
            formValue: autoData()[form.formKey],
          });
          setShowArchiveWarning(true);
          return;
        }
        await paperlessForm.changeSectionArchiveStatus('archive', form.formKey);
        if (removeFromSelection) {
          paperlessForm.selectSection({ form });
        }
        paperlessForm.setIsSectionArchived(form.formKey);
        await refetchAutomationQueryData();
      } catch (err) {
        notification.showInfo(err.message);
      }
    } else if (e === 'Remove') {
      try {
        await paperlessForm.removeSectionFromGroup(
          formGroups.selectedGroup.id,
          form.formKey,
        );
        if (removeFromSelection) {
          paperlessForm.selectSection({ form });
        }
        paperlessForm.setIsSectionRemovedFromGroup(form.formKey);
      } catch (err) {
        notification.showInfo(err.message);
      }
    }
  };

  const addSelectedToGroups = () => {
    paperlessForm.selectedSections.forEach((form) => {
      if (form !== undefined) {
        if (form.form.formKey !== 'formConsentDisclosure') {
          paperlessForm.addSectionsToAddToGroups(form.form.formKey);
        }
      }
    });
    setShowAddToGroup(true);
  };

  useEffect(() => {
    if (isPrinting) {
      const combinedFormJSON = {
        components: [],
        display: 'form',
      };
      paperlessForm.selectedSections.forEach((form) => {
        if (
          form !== undefined &&
          form.form.formKey !== 'formConsentDisclosure'
        ) {
          form.form.formJson.components.forEach((component) => {
            combinedFormJSON.components.push(component);
          });
        }
      });
      paperlessForm.setPrintingData(combinedFormJSON);
    }
  }, [isPrinting]); // eslint-disable-line react-hooks/exhaustive-deps

  const getSelectionCount = () => {
    // -1 is used to compensate for the consent form, which is in selected forms by default
    return paperlessForm.selectedSections.filter((a) => a).length - 1;
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen); //NOSONAR
  };

  const handleClose = (e) => {
    if (anchorRef.current && anchorRef.current.contains(e.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleItemClick = (option) => {
    setOpen(false);
    if (option === 'send_these_to_patient') {
      setShowSendFormsToPatients(true);
    } else if (option === 'add_to_group') {
      addSelectedToGroups();
    } else if (option === 'print') {
      if (mergeAndPrint) {
        setShowPrintPreview(true);
        paperlessForm.printSelectedForms();
      } else {
        setIsPrinting(true);
      }
    }
  };

  const clearSearchField = () => {
    paperlessForm.setSearchItem('');
    searchTermRef.current.value = '';
  };

  useEffect(() => {
    refreshSections(true, paperlessForm.searchItem);
  }, [paperlessForm.searchItem]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => paperlessForm.setSearchItem('');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFormSearch = debounce((searchText) => {
    paperlessForm.setSearchItem(searchText);
  }, 500);

  return (
    <div className={styles.root}>
      <div>
        <div className={styles.headerContainer}>
          <div className="d-flex align-items-center w-100">
            <div className={styles.headerText}>Forms</div>
            {formAutomation &&
            userPermissionsQuery?.data?.canViewPaperlessFormsAutomation ? (
              <div className="d-flex align-items-center">
                <span className={styles.subtitleText}>Automation</span>
                <span className="ms-1" onClick={() => setShowAutomation(true)}>
                  <SettingsIcon className={styles.icon} />
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <Grid container spacing={1}>
          <Grid container item xs={12} className={styles.formMargin}>
            <Grid container item xs={6}>
              <Grid item xs={11}>
                {' '}
                <Button
                  className={`${classes.actionBtn} secondary-btn`}
                  variant="contained"
                  color="secondary"
                  ref={anchorRef}
                  onClick={handleToggle}
                  aria-controls={open ? 'menu-list-grow' : undefined}
                  aria-haspopup="true"
                  endIcon={<ArrowDropDownIcon color="#FFFFFF" />}
                  disabled={getSelectionCount() === 0}
                >
                  Action
                </Button>
                <Popper
                  open={open}
                  anchorEl={anchorRef.current}
                  role={undefined}
                  transition
                  disablePortal
                  placement="bottom"
                  className={styles.popper}
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: 'center top' }}
                    >
                      <Paper elevation={4}>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList
                            autoFocusItem={open}
                            id="menu-list-grow"
                            className="p-0"
                            onKeyDown={handleListKeyDown}
                          >
                            {actionItems.map((item) => (
                              <MenuItem
                                disabled={getSelectionCount() === 0}
                                key={item.id}
                                onClick={() => handleItemClick(item.value)}
                                className={styles.menuItem}
                              >
                                <span>{item.label}</span>
                              </MenuItem>
                            ))}
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
                {isPrinting && (
                  <ReactToPrint
                    trigger={() => (
                      <PrintButton
                        setIsPrinting={setIsPrinting}
                        disabled={getSelectionCount() === 0}
                      />
                    )}
                    content={() => ref.current}
                  />
                )}
              </Grid>
              <Grid item xs={1}></Grid>
            </Grid>
            <Grid container item xs={6}>
              <Grid item xs={12}>
                <Button
                  className={`${classes.patientBtn} secondary-btn`}
                  variant="outlined"
                  color="secondary"
                  size="medium"
                  onClick={() => setShowPatientQueue(true)}
                >
                  Patient Queues
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div className={styles.subHeaderContainer}>
          <div className={`${styles.searchBar}`}>
            <SearchIcon className="me-1" />
            <InputBase
              className={styles.inputBox}
              placeholder="Search..."
              onChange={(e) => handleFormSearch(e.target.value)}
              inputRef={searchTermRef}
            />
            <Fade in={!!searchTermRef.current?.value}>
              <IconButton
                style={{ color: '#999999' }}
                onClick={clearSearchField}
              >
                <ClearIcon style={{ fontSize: '18px' }} />
              </IconButton>
            </Fade>
          </div>
          <div className={styles.subHeaderText}>
            {getSelectionCount() > 0 ? (
              <Button color="primary" onClick={handleUncheckAllSections}>
                Uncheck All
              </Button>
            ) : (
              <Button color="primary" onClick={handleSelectAllSections}>
                Select All
              </Button>
            )}
            {getSelectionCount() > 0 && (
              <span className={styles.xSelectedText}>
                {getSelectionCount()} Selected
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionContainer}>
        <Scrollbars
          style={{ height: '100%' }}
          renderTrackHorizontal={(props) => <div {...props} />}
        >
          {loading === true && <PaperlessFormSkeleton count={5} />}
          {!loading && formSections?.length === 0 && (
            <span className={styles.empty}>Empty</span>
          )}
          {!loading && formSections?.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="paperlessformsections">
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {formSections.map((form, index) => (
                      <Draggable
                        key={form.formKey}
                        draggableId={form.formKey}
                        index={index}
                      >
                        {(innerProvided, innerSnapshot) => (
                          <div
                            className={styles.section}
                            ref={innerProvided.innerRef}
                            {...innerProvided.draggableProps}
                            style={getItemStyle(
                              innerSnapshot.isDragging,
                              innerProvided.draggableProps.style,
                            )}
                          >
                            <div {...innerProvided.dragHandleProps}>
                              <DragIndicatorIcon style={{ color: '#9A9A9A' }} />
                            </div>
                            {innerSnapshot.isDragging ? (
                              <div className="ms-1" style={{ color: '#FFF' }}>
                                {form.name}
                              </div>
                            ) : (
                              <div className="w-100 d-flex align-items-center">
                                <Checkbox
                                  checked={showChecked(form.formKey)}
                                  onClickFunc={() =>
                                    toggleSectionSelection(form, index)
                                  }
                                />
                                <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                                  <div>{form.name}</div>
                                  <div>
                                    {formGroups.selectedGroup.id ===
                                    'all_sections' ? (
                                      <Menu
                                        menuItems={unarchivedMenuItems}
                                        onChangeValue={(e) => {
                                          handleMenuClick(e, form);
                                        }}
                                      />
                                    ) : (
                                      <Menu
                                        menuItems={
                                          unarchivedNonAllSectionsMenuItems
                                        }
                                        onChangeValue={(e) => {
                                          handleMenuClick(e, form);
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {isPrinting && (
            <div style={{ display: 'none' }}>
              <div ref={ref}>
                <Form src={paperlessForm.printingData} />
              </div>
            </div>
          )}
          {showAddToGroup === true && (
            <AddToGroup onClose={() => setShowAddToGroup(false)} />
          )}
          {showSendFormsToPatients === true && (
            <SendFormsToPatients
              onClose={() => setShowSendFormsToPatients(false)}
            />
          )}
          {showPatientQueue === true && (
            <PatientFormQueues onClose={() => setShowPatientQueue(false)} />
          )}
          {showAutomation === true && (
            <Automation onClose={() => setShowAutomation(false)} />
          )}
        </Scrollbars>
      </div>

      {showArchiveWarning && (
        <AutomationArchiveWarning
          onClose={() => setShowArchiveWarning(false)}
          formKey={showFormKeyAutomationWarning}
        />
      )}

      {showPrintPreview ? (
        <Modal
          size="lg"
          allowClosing={!paperlessForm.generatingPdf}
          header=""
          onClose={() => setShowPrintPreview(false)}
          body={
            <div
              style={{
                height: '74vh',
              }}
            >
              {
                <PDFViewer
                  showControls={true}
                  loading={paperlessForm.generatingPdf}
                  file={paperlessForm.generatedPdfUrl}
                  renderMode="canvas"
                  scale={2}
                />
              }
            </div>
          }
        />
      ) : null}
    </div>
  );
};

export default observer(PaperlessFormSections);
