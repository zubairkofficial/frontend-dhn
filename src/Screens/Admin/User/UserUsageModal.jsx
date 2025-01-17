import React from "react";
import { Modal, Spinner, Button } from "react-bootstrap";
//import 'bootstrap/dist/css/bootstrap.min.css';


const UserUsageModal = ({
  showModal,
  handleCloseModal,
  loadingModal,
  modalError,
  documentCount,
  contractSolutionCount,
  dataProcessCount,
  cloneDataProcessCount,
}) => {
  return (
    <Modal
      show={showModal}
      onHide={handleCloseModal}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton>
        <Modal.Title>User Usage</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingModal ? (
          <div className="flex justify-center items-center h-32">
            <Spinner animation="border" />
          </div>
        ) : modalError ? (
          <p className="text-red-500">Error: {modalError}</p>
        ) : (
          <div className="p-4 bg-white rounded-lg shadow-md">
            <p><strong>Document Count:</strong> {documentCount}</p>
            <p><strong>Contract Solution Count:</strong> {contractSolutionCount}</p>
            <p><strong>Data Processes Count:</strong> {dataProcessCount}</p>
            <p><strong>Clone Data Processes Count:</strong> {cloneDataProcessCount}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserUsageModal;
