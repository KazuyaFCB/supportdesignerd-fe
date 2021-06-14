
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

export default function WaitingDialog({openLoading}) {
    return (
        <Dialog open={openLoading} aria-labelledby="form-dialog-title">
            <DialogContent>
                <img src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif" />
                <DialogContentText>
                    Processing your request, please wait a moment...
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}