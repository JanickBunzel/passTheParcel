import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/lib/utils';

type Props = {
    file?: File;
    onChange: (file?: File) => void;
    placeholder?: string;
    allowedMimeTypes?: string[];
};

const FileInput = ({ file, onChange, placeholder, allowedMimeTypes = [] }: Props) => {
    const ref = useRef<HTMLInputElement>(null);

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="group w-full p-0 gap-0 justify-between bg-accent font-semibold overflow-hidden"
                onClick={() => ref.current?.click()}
            >
                <span
                    className={cn(
                        'flex-1 text-left truncate px-3 py-2 font-medium',
                        !file && 'font-normal text-muted-foreground'
                    )}
                >
                    {file?.name ?? placeholder ?? 'Select File'}
                </span>

                <span className="h-full px-3 bg-transparent group-hover flex items-center justify-center">
                    <Upload />
                </span>
            </Button>

            <input
                ref={ref}
                type="file"
                accept={allowedMimeTypes?.join(',')}
                className="hidden"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) onChange(selectedFile);
                }}
            />
        </>
    );
};

export default FileInput;
