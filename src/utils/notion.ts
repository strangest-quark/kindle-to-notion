import { Block, BlockType, CreatePageProperties } from "../interfaces";

/* Function to make an array of Notion blocks given the array of highlights and the block type
   Used when appending highlights to an existing Notion page for the book */
export const makeBlocks = (kinds: string[], contents: string[]): Block[] => {
  const blocks: Block[] = [];
  for (let i = 0; i < contents.length; i++) {
    const kind = kinds[i];

    let type = BlockType.paragraph;
    if (kind == "note") {
      type = BlockType.callout;
    }
    if (kind == "bookmark") {
      type = BlockType.divider;
    }
    const content = contents[i];
    // truncate the content to a maximum length of 2000 character due to Notion API limitation
    const validContent =
      content.length > 2000 ? content.substring(0, 2000) : content;
    const block: Block = {
      object: "block",
      type,
    };
    if (kind == "bookmark") {
      type = BlockType.divider;
      block[type] = {
      }
    } else {
      block[type] = {
        text: [
          {
            type: "text",
            text: {
              content: validContent,
              link: null,
            },
          },
        ],
      };
    }
    blocks.push(block);
  }
  return blocks;
};


/* Function to make an array of Notion blocks.
   Used when creating a new Notion page for the book*/
export const makeHighlightsBlocks = (
  kinds: string[],
  highlights: string[]
): Block[] => {
  return [
    ...makeBlocks(kinds, highlights),
  ];
};

/* Function to generate the configuration required to create a new Notion page */
export const makePageProperties = (
  pageProperties: CreatePageProperties
): Record<string, unknown> => {
  const properties = {
    Title: {
      title: [
        {
          text: {
            content: pageProperties.title,
          },
        },
      ],
    },
    Author: {
      type: "rich_text",
      rich_text: [
        {
          type: "text",
          text: {
            content: pageProperties.author,
          },
        },
      ],
    },
    "Book Name": {
      type: "rich_text",
      rich_text: [
        {
          type: "text",
          text: {
            content: pageProperties.bookName,
          },
        },
      ],
    },
  };
  return properties;
};
