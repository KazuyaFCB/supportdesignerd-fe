import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import "./index.css";

export default function WaitingDialog({ openLoading, content }) {
  return (
    <Dialog
      open={openLoading}
      aria-labelledby="form-dialog-title"
      className="dialog-container"
    >
      <DialogContent className="dialog-content">
        <img src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif" />
        <DialogContentText className="dialog-text">
          Processing your request, please wait a moment...
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
