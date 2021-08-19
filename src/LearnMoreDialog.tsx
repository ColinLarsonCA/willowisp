import React from 'react';
import { Button, Dialog, DialogActions, DialogContent } from "@material-ui/core";

export interface LearnMoreDialogProps {
  open: boolean;
  onClose: () => void;
  explanation: string;
}

export default function LearnMoreDialog(props: LearnMoreDialogProps) {
  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogContent>{props.explanation}</DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}