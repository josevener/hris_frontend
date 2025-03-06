import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ onConfirm, onCancel, isDeleting }) => (
  <DialogContent className="bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
    <DialogHeader>
      <DialogTitle className="dark:text-white">Confirm Deletion</DialogTitle>
      <DialogDescription className="dark:text-gray-300">
        <span>Are you sure you want to delete this record?</span>
        <br />
        <span>This action cannot be undone.</span>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={onCancel}
        className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={onConfirm}
        disabled={isDeleting}
        className="dark:bg-red-700 dark:hover:bg-red-600"
      >
        {isDeleting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
          </>
        ) : (
          "Delete"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
);

export default DeleteConfirmation;