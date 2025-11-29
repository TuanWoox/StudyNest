import { useEffect, useRef } from "react";
import { useCreateEditor } from "../../hooks/editorHook/useCreateEditor";
import { OutputBlockData } from "@editorjs/editorjs";

interface EditorProps {
    holderElementId?: string;
    data?: OutputBlockData[];
    onChangeOutside?: (outputData: any) => void;
    readOnly?: boolean;
}

const Editor = ({ holderElementId = "editorjs", data = [], onChangeOutside, readOnly = false }: EditorProps) => {
    const editorRef = useCreateEditor({ holderElementId, data, onChangeOutside, readOnly });
    const previousHolderIdRef = useRef<string | null>(null);
    const initialDataRef = useRef(data);

    // Only re-render when holderElementId changes (switching notes)
    useEffect(() => {
        if (editorRef.current && initialDataRef.current) {
            // Only render if holderElementId changed (switching to a different note)
            if (previousHolderIdRef.current !== holderElementId) {
                editorRef.current.isReady.then(() => {
                    editorRef.current?.render({ blocks: initialDataRef.current });
                    previousHolderIdRef.current = holderElementId;
                });
            }
        }
    }, [holderElementId, editorRef]);

    // Update initial data ref when holderElementId changes
    useEffect(() => {
        initialDataRef.current = data;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [holderElementId]);

    return <div id={holderElementId} className="editor-output"></div>;
};

export default Editor;