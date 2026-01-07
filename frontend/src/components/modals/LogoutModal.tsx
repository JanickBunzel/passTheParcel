import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/shadcn/dialog';
import { Button } from '@/components/shadcn/button';
import { LogOut } from 'lucide-react';

type Props = {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    logout: () => Promise<void>;
};

const LogoutModal = ({ open, onOpenChange, logout }: Props) => {
    const handleLogout = async () => {
        onOpenChange(false);
        logout();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col max-w-sm! gap-8" showCloseButton={false}>
                <DialogTitle className="text-lg font-semibold">Do you want to logout?</DialogTitle>
                <DialogDescription className="sr-only">Confirm to logout from your account.</DialogDescription>

                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/60">
                        Cancel
                    </Button>

                    <Button variant="destructiveOutline" onClick={handleLogout}>
                        <LogOut />
                        Logout
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LogoutModal;
