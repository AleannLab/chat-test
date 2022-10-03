import React, { useState } from "react";
import "./index.css";
import PropTypes from "prop-types";
import { Scrollbars } from "react-custom-scrollbars";
import Button from "@material-ui/core/Button";
import DownloadIcon from "assets/images/download.svg";
import PrintIcon from "@material-ui/icons/Print";
import printJS from "print-js";
import CircularProgress from "@material-ui/core/CircularProgress";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";
import GamesIcon from "@material-ui/icons/Games";
import DeleteIcon from "assets/images/delete.svg";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { useStores } from "hooks/useStores";

// If you want to import more modules then import them above this line
import { Document, Page, pdfjs } from "react-pdf";
import { fetchBlob } from "helpers/fetch";
import { FAX_LOADING_STATUS } from "helpers/constants";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const LoadingPreview = ({ text = "Loading File..." }) => {
  return (
    <div style={{ marginTop: "5em" }} className="d-flex justify-content-center">
      <div className="d-flex flex-column align-items-center">
        <CircularProgress color="secondary" />
        <span className="mt-4" style={{ fontSize: "1rem" }}>
          {text}
        </span>
      </div>
    </div>
  );
};

const PDFViewer = ({
  file,
  onPrint,
  onPrinted,
  allowDelete,
  showControls,
  loading,
  renderMode,
  scale,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [zoomSize, setZoomSize] = useState("max"); // Value shuould be either 'min' or 'max'
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const { activityLogs, notification } = useStores();

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handlePrintPDF = async () => {
    try {
      if (onPrint) onPrint();
      setIsPrinting(true);
      const blob = await fetchBlob(file);
      const objectURL = URL.createObjectURL(blob);
      printJS(objectURL, "pdf");
    } catch (error) {
      console.error(error);
    } finally {
      if (onPrinted) onPrinted();
      setIsPrinting(false);
    }
  };

  const handleZoom = () =>
    zoomSize === "max" ? setZoomSize("min") : setZoomSize("max");

  const status = activityLogs.selectedActivity?.status?.toLowerCase() ?? "";
  const getFaxPreview = () => {
    if (loading) return <LoadingPreview text="Loading Preview..." />;
    if (!file && FAX_LOADING_STATUS.includes(status))
      return (
        <LoadingPreview text="Preview will be available once the fax is finished processing " />
      );
    if (file)
      return (
        <div id="pdf-document-content">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="pdf-document"
            loading={<LoadingPreview />}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderAnnotationLayer={false}
                loading={<CircularProgress color="secondary" />}
                renderMode={renderMode}
                scale={scale}
                className={`pdf-page ${
                  zoomSize === "max" ? "max-zoom" : "min-zoom"
                }`}
              />
            ))}
          </Document>
        </div>
      );
    return (
      <div className="d-flex justify-content-center">No attachments found!</div>
    );
  };

  return (
    <div className="h-100 kasper-pdf-viewer__root">
      {showControls && !loading ? (
        <div className="toolbar">
          {allowDelete && (
            <Button
              className="toolbar-btn me-2"
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<DeleteIcon style={{ fontSize: "1rem" }} />}
              onClick={() => setOpenConfirmation(true)}
            >
              <span>Delete</span>
            </Button>
          )}
          {file && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                className="toolbar-btn me-2"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrintPDF}
                disabled={isPrinting}
              >
                <span>Print</span>
              </Button>

              <a href={file} download target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outlined"
                  color="secondary"
                  className="toolbar-btn me-2"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() =>
                    notification.showInfo(
                      "Please ensure you enable pop-ups if the download does not initiate"
                    )
                  }
                >
                  <span>Download</span>
                </Button>
              </a>
              <Button
                variant="outlined"
                color="secondary"
                className="toolbar-btn me-2"
                size="small"
                onClick={handleZoom}
                title={zoomSize === "max" ? "Zoom out" : "Zoom in"}
                style={{ minWidth: "auto" }}
              >
                {zoomSize === "max" ? <GamesIcon /> : <ZoomOutMapIcon />}
              </Button>
            </>
          )}
        </div>
      ) : null}
      <Scrollbars
        style={{ height: "100%" }}
        renderTrackHorizontal={(props) => <div {...props} />}
      >
        {getFaxPreview()}
      </Scrollbars>
      {openConfirmation && (
        <ConfirmDeleteDialog onClose={() => setOpenConfirmation(false)} />
      )}
    </div>
  );
};

PDFViewer.propTypes = {
  file: PropTypes.string.isRequired,
  renderMode: PropTypes.oneOf(["svg", "canvas"]),
  scale: PropTypes.number,
};

PDFViewer.defaultProps = {
  renderMode: "svg",
  scale: 1,
  showControls: true,
};

export default PDFViewer;
