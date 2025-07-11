import React, { useState, useEffect } from 'react';
import API from '../../api';
import Button from '../../components/common/Button';

// --- TipTap Imports (complete list) ---
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CharacterCount from '@tiptap/extension-character-count';
import FontSize from '../../tiptap/FontSize'; // Your custom font size extension

// Local Components
import TipTapMenuBar from '../../components/common/TipTapMenuBar';
import '../../tiptap.css';

const SendNewsletterPage = () => {
    // --- State Management ---
    const [subject, setSubject] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // This state will now be force-updated by the editor.
    const [wordCount, setWordCount] = useState(0);

    // --- Editor Configuration ---
    const WORD_COUNT_LIMIT = 5000;

    const editor = useEditor({
        extensions: [
            // Your full list of extensions...
            StarterKit, TextStyle, Color, FontSize, Underline,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false, autolink: true }),
            Image.configure({ allowBase64: true }),
            TaskList, TaskItem.configure({ nested: true }),
            HorizontalRule, Subscript, Superscript,
            CharacterCount.configure({ limit: WORD_COUNT_LIMIT, mode: 'word' }),
        ],
        content: '',

        // === THE DEFINITIVE FIX: FORCING A STATE UPDATE ===
        // The onUpdate callback will now run on EVERY content change
        // and trigger a React state update, forcing a re-render.
        onUpdate: ({ editor }) => {
            setWordCount(editor.storage.characterCount.words());
        },

        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-lg max-w-none focus:outline-none p-4',
            },
        },
    });

    // --- Cleanup Effect ---
    // Ensure the editor instance is destroyed when the component unmounts to prevent memory leaks.
    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editor) return;

        const htmlContent = editor.getHTML();
        if (!subject || editor.isEmpty) {
            setError('Please provide both a subject and some content.');
            return;
        }

        if (!window.confirm("Are you sure you want to send this newsletter to all subscribers?")) return;

        setIsSending(true);
        setError(null);
        setSuccessMessage('');

        try {
            const { data } = await API.post('/api/newsletter/send', { subject, htmlContent });
            setSuccessMessage(data.message);
            setSubject('');
            editor.commands.clearContent();
        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-1 text-gray-800">Compose & Send Newsletter</h1>
            <p className="text-gray-500 mb-6">Create a new newsletter to send to all your subscribers.</p>

            {successMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert"><p className="font-bold">Success!</p><p>{successMessage}</p></div>}
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                    <input
                        type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light"
                        placeholder="Your engaging newsletter subject..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
                    <div className="border border-gray-300 rounded-md shadow-sm">
                        <TipTapMenuBar editor={editor} />

                        <EditorContent editor={editor} className="bg-white min-h-[300px] rounded-b-md" />

                        <div className="text-right text-xs text-gray-400 p-2 border-t border-gray-200">
                            <span className={wordCount > WORD_COUNT_LIMIT ? 'text-red-500 font-semibold' : ''}>
                                {wordCount.toLocaleString()}
                            </span> / {WORD_COUNT_LIMIT.toLocaleString()} words
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button type="submit" disabled={isSending || !editor || editor.isEmpty}>
                        {isSending ? 'Sending...' : 'Send to All Subscribers'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SendNewsletterPage;