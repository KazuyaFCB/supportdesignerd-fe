import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import "./index.css";

export default function WaitingDialog({
  openLoading,
  text,
  isConverting,
  textConverting,
}) {
  return (
    <Dialog
      open={openLoading}
      aria-labelledby="form-dialog-title"
      className="dialog-container"
    >
      <DialogContent className="dialog-content">
        <img src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif" />
        {isConverting ? (
          <DialogContentText className="dialog-text">
            {textConverting}, vui lòng đợi...
          </DialogContentText>
        ) : (
          <DialogContentText className="dialog-text">
            {text}, vui lòng đợi...
          </DialogContentText>
        )}
      </DialogContent>
    </Dialog>
  );
}
