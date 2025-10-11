import { useEffect, useRef } from 'react';
import EditorJS, {
    OutputBlockData,
    OutputData,
    ToolConstructable,
} from '@editorjs/editorjs';

// ─── Text & Typography ────────────────────────────────────────────────
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Warning from '@editorjs/warning';
import Alert from 'editorjs-alert';
import CoolBytesDelimiter from '@coolbytes/editorjs-delimiter';

// ─── Lists ────────────────────────────────────────────────────────────
import List from '@editorjs/list';

// ─── Media & Embeds ───────────────────────────────────────────────────
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import EJLaTeX from 'editorjs-latex';

// ─── Tables ───────────────────────────────────────────────────────────
import Table from '@editorjs/table';

// ─── Code ─────────────────────────────────────────────────────────────
import AceCodeEditorJS from 'ace-code-editorjs';
import aceConfig from '../../config/aceCodeConfig';

// ─── Inline Tools ─────────────────────────────────────────────────────
import InlineCode from '@editorjs/inline-code';
import createGenericInlineTool from 'editorjs-inline-tool';
import Strikethrough from '@sotaproject/strikethrough';
import ColorPlugin from 'editorjs-text-color-plugin';

// ─── Block Tune Tools ─────────────────────────────────────────────────
import AlignmentTuneTool from 'editorjs-text-alignment-blocktune';
import TextVariantTune from '@editorjs/text-variant-tune';
import NoticeTune from 'editorjs-notice';
import IndentTune from 'editorjs-indent-tune';

// ─── Plugins ──────────────────────────────────────────────────────────
import Undo from 'editorjs-undo';
import DragDrop from 'editorjs-drag-drop';
import MultiBlockSelectionPlugin from 'editorjs-multiblock-selection-plugin';
import instance from '@/config/axiosConfig';
import { ImageToolTune } from 'editorjs-image-resize-crop';

const baseURL = import.meta.env.VITE_API_URL

export interface InputForCreateEditor {
    holderElementId?: string;
    data?: OutputBlockData[];
    onChangeOutside?: (outputData: OutputData) => void;
}

export function useCreateEditor({
    holderElementId = 'editorJs',
    data = [],
    onChangeOutside,
}: InputForCreateEditor) {
    const editorRef = useRef<EditorJS | null>(null);

    useEffect(() => {
        if (!editorRef.current) {
            const editor = new EditorJS({
                holder: holderElementId,
                autofocus: false,
                placeholder: 'Type something amazing...',
                data: { blocks: data },

                tools: {
                    // ── Text & Typography ────────────────────────────────
                    header: { class: Header as unknown as ToolConstructable },
                    paragraph: {
                        class: Paragraph as unknown as ToolConstructable,
                        inlineToolbar: true,
                    },
                    quote: Quote,
                    warning: Warning,
                    alert: Alert,
                    delimiter: CoolBytesDelimiter,

                    // ── Lists ───────────────────────────────────────────
                    list: List,

                    // ── Media & Embed ──────────────────────────────────
                    image: {
                        class: ImageTool,
                        tunes: ['alignmentTune', 'imageResize'], // Allow users to choose left, center, right
                        config: {
                            uploader: {
                                uploadByFile(file) {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    return instance.post(`${baseURL}/Image`, formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' },
                                    }).then(({ data }) => ({
                                        success: data?.result?.success,
                                        file: { url: data?.result?.file?.url },
                                    }));
                                },
                            },
                        },
                    },
                    embed: Embed,
                    Math: {
                        class: EJLaTeX,
                        shortcut: 'CMD+SHIFT+M',
                    },

                    // ── Tables ─────────────────────────────────────────
                    table: Table,

                    // ── Code ───────────────────────────────────────────
                    code: {
                        class: AceCodeEditorJS,
                        config: aceConfig,
                    },

                    // ── Inline Tools ───────────────────────────────────
                    Marker: {
                        class: ColorPlugin,
                        config: {
                            defaultColor: '#FFBF00',
                            type: 'marker',
                            icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g><path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25l6.6-0.6c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"/><path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"/></g><path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"/></svg>`,
                        },
                    },
                    Color: {
                        class: ColorPlugin,
                        config: {
                            colorCollections: [
                                '#EC7878', '#9C27B0', '#673AB7', '#3F51B5', '#0070FF',
                                '#03A9F4', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFF',
                            ],
                            defaultColor: '#FF1300',
                            type: 'text',
                            customPicker: true,
                        },
                    },
                    inlineCode: InlineCode,
                    bold: {
                        class: createGenericInlineTool({
                            sanitize: { strong: {} },
                            shortcut: 'CMD+B',
                            tagName: 'STRONG',
                            toolboxIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 0 1 0 8H6z"/></svg>`,
                        }),
                    },
                    underline: {
                        class: createGenericInlineTool({
                            sanitize: { u: {} },
                            shortcut: 'CMD+U',
                            tagName: 'U',
                            toolboxIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>`,
                        }),
                    },
                    italic: {
                        class: createGenericInlineTool({
                            sanitize: { em: {} },
                            shortcut: 'CMD+I',
                            tagName: 'EM',
                            toolboxIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>`,
                        }),
                    },
                    strikethrough: Strikethrough,

                    // ── Block Tunes ─────────────────────────────────────
                    alignmentTune: AlignmentTuneTool,
                    textVariantTune: TextVariantTune,
                    noticeTune: NoticeTune,
                    indentTune: {
                        class: IndentTune as unknown as ToolConstructable,
                    },
                    imageResize: {
                        class: ImageToolTune as unknown as ToolConstructable,
                        config: { resize: true, crop: false },
                    },
                },

                tunes: [
                    'textVariantTune',
                    'alignmentTune',
                    'noticeTune',
                    'indentTune',
                ],

                onReady: () => {
                    new Undo({ editor });
                    new DragDrop(editor);
                    editorRef.current = editor;

                    const multiblockPlugin = new MultiBlockSelectionPlugin({
                        editor,
                        version: EditorJS.version,
                    });

                    editor.isReady.then(() => multiblockPlugin.listen());

                    window.addEventListener(
                        MultiBlockSelectionPlugin.SELECTION_CHANGE_EVENT,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (ev: any) => {
                            const selectedBlocks = ev.detail.selectedBlocks;
                            console.log('Selected blocks:', selectedBlocks);
                        }
                    );
                },

                onChange: async () => {
                    if (onChangeOutside && editorRef.current) {
                        const outputData = await editorRef.current.save();
                        onChangeOutside(outputData);
                    }
                },
            });
        }

        return () => {
            editorRef.current?.destroy();
            editorRef.current = null;
        };
    }, [holderElementId]); // CHỈ phụ thuộc vào holderElementId

    return editorRef;
}
