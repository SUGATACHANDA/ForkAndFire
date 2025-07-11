import React, { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    // Basic Formatting
    faBold, faItalic, faUnderline, faStrikethrough,
    // Lists & Tasks
    faListUl, faListOl, faTasks,
    // Alignment & Block Elements
    faHeading, faQuoteRight, faAlignLeft, faAlignCenter, faAlignRight,
    // Effects & Styles
    faHighlighter, faPalette, faSubscript, faSuperscript, faTextHeight,
    // Actions & Structure
    faLink, faUnlink, faImage, faMinus, faCode,
    // History
    faUndo, faRedo
} from '@fortawesome/free-solid-svg-icons';

// Reusable internal button component for a consistent look
const MenuButton = ({ icon, onClick, isActive, title, disabled = false }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${isActive ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-200'
            } ${disabled ? 'text-gray-300 hover:bg-transparent cursor-not-allowed' : ''
            }`}
    >
        <FontAwesomeIcon icon={icon} size="sm" />
    </button>
);

const TipTapMenuBar = ({ editor }) => {
    // Handler for adding or editing a link
    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl || 'https://');
        if (url === null) return;
        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
    }, [editor]);

    // Handler for adding an image from a URL
    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('Enter Image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    // If the editor instance from the parent component isn't ready, render nothing to prevent errors.
    if (!editor) {
        return null;
    }

    // Predefined font sizes for the dropdown
    const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '30', '36'];
    const currentFontSize = editor.getAttributes('textStyle').fontSize?.replace('px', '') || '16';

    return (
        <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-gray-300 bg-gray-50 rounded-t-md">

            {/* --- Font Size & Color Group --- */}
            <div className="flex items-center p-1 rounded-md hover:bg-gray-200" title="Font Size">
                <FontAwesomeIcon icon={faTextHeight} className="text-gray-500 w-4 h-4 mx-1" />
                <select
                    onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                    value={currentFontSize}
                    className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer pr-1"
                >
                    {FONT_SIZES.map(size => (
                        <option key={size} value={size}>{size}px</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center p-1 rounded-md hover:bg-gray-200" title="Text Color">
                <FontAwesomeIcon icon={faPalette} className="text-gray-500 w-4 h-4" />
                <input type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#333333'} className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer" />
            </div>

            <div className="border-l h-6 mx-2 border-gray-200"></div>

            {/* --- Text Formatting Group --- */}
            <MenuButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={faBold} />
            <MenuButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={faItalic} />
            <MenuButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={faUnderline} />
            <MenuButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={faStrikethrough} />
            <MenuButton title="Highlight" onClick={() => editor.chain().focus().toggleHighlight({ color: '#FEF9C3' }).run()} isActive={editor.isActive('highlight')} icon={faHighlighter} />
            <MenuButton title="Superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} icon={faSuperscript} />
            <MenuButton title="Subscript" onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} icon={faSubscript} />

            <div className="border-l h-6 mx-2 border-gray-200"></div>

            {/* --- Block & Heading Group --- */}
            <MenuButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={faHeading} />
            <MenuButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={faQuoteRight} />
            <MenuButton title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={faCode} />

            <div className="border-l h-6 mx-2 border-gray-200"></div>

            {/* --- Alignment Group --- */}
            <MenuButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={faAlignLeft} />
            <MenuButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={faAlignCenter} />
            <MenuButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={faAlignRight} />

            <div className="border-l h-6 mx-2 border-gray-200"></div>

            {/* --- List Group --- */}
            <MenuButton title="Bulleted List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={faListUl} />
            <MenuButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={faListOl} />
            <MenuButton title="Task List" onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={faTasks} />

            <div className="border-l h-6 mx-2 border-gray-200"></div>

            {/* --- Action Group --- */}
            <MenuButton title="Add Link" onClick={setLink} isActive={editor.isActive('link')} icon={faLink} />
            <MenuButton title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} icon={faUnlink} />
            <MenuButton title="Add Image via URL" onClick={addImage} icon={faImage} />
            <MenuButton title="Insert Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={faMinus} />

            <div className="flex-grow"></div> {/* Spacer to push history buttons to the end */}

            {/* --- History Group --- */}
            <div className="flex items-center gap-1">
                <MenuButton title="Undo" onClick={() => editor.chain().focus().undo().run()} icon={faUndo} disabled={!editor.can().undo()} />
                <MenuButton title="Redo" onClick={() => editor.chain().focus().redo().run()} icon={faRedo} disabled={!editor.can().redo()} />
            </div>
        </div>
    );
};

export default TipTapMenuBar;