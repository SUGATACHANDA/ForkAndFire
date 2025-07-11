import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

// This is a custom TipTap extension that adds a 'fontSize' attribute
// to the existing 'textStyle' mark. This is the official, recommended way
// to add custom styling like font size without creating conflicting tags.

const FontSize = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'], // It will apply to the textStyle mark
        };
    },

    // Add the ability to parse font-size from pasted HTML
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace('px', ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}px`,
                            };
                        },
                    },
                },
            },
        ];
    },

    // Add commands so we can control it from our menu bar
    addCommands() {
        return {
            setFontSize: (fontSize) => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});

export default FontSize;