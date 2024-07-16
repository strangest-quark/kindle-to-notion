import _ from "lodash";
import { Clipping, GroupedClipping } from "../interfaces";
import { writeToFile, readFromFile, formatAuthorName } from "../utils";

export class Parser {
  private fileName = "My Clippings.txt";
  private regexHighlight =
    /(.+) \((.+)\)\r*\n- (?:Seu destaque|Your Highlight|La subrayado|Deine Markierung|\u60a8\u5728\u4f4d)(.+)\r*\n\r*\n(.+)/gm;
  private regexNote =
    /(.+) \((.+)\)\r*\n- (?:Your Note|\u60a8\u5728\u4f4d)(.+)\r*\n\r*\n(.+)/gm;
  private regexBookmark =
    /(.+) \((.+)\)\r*\n- (?:Your Bookmark|\u60a8\u5728\u4f4d)/gm;

  private splitter = /=+\r*\n/gm;
  private nonUtf8 = /\uFEFF/gmu;
  private clippings: Clipping[] = [];
  private groupedClippings: GroupedClipping[] = [];

  /* Method to print the stats of Clippings read from My Clippings.txt */
  printStats = () => {
    console.log("\n💹 Stats for Clippings");
    for (const groupedClipping of this.groupedClippings) {
      console.log("--------------------------------------");
      console.log(`📝 Title: ${groupedClipping.title}`);
      console.log(`🙋 Author: ${groupedClipping.author}`);
      console.log(`💯 Highlights Count: ${groupedClipping.contents.length}`);
    }
    console.log("--------------------------------------");
  };

  /* Method to export the final grouped clippings to a file */
  exportGroupedClippings = () => {
    writeToFile(this.groupedClippings, "grouped-clippings.json", "data");
  };

  /* Method add the parsed clippings to the clippings array */
  addToClippingsArray = (kind: Clipping["kind"], match: RegExpExecArray | null) => {
    if (match) {
      const title = match[1];
      let content;
      let author = formatAuthorName(match[2]);
      if (kind != "bookmark") {
        content = match[4];
      } else {
        content = "";
      }
      this.clippings.push({ title, author, kind, content });
    }
  };

  /* Method to group clippings (highlights) by the title of the book */
  groupClippings = () => {
    console.log("\n➕ Grouping Clippings");
    this.groupedClippings = _.chain(this.clippings)
      .groupBy("title")
      .map((clippings, title) => ({
        title,
        author: clippings[0].author,
        kinds: clippings.map((clipping) => clipping.kind),
        contents: clippings.map((clipping) => clipping.content),
      }))
      .value();
  };

  /* Method to parse clippings (highlights) and add them to the clippings array */
  parseClippings = () => {
    console.log("📋 Parsing Clippings");
    const clippingsRaw = readFromFile(this.fileName, "resources");

    // filter clippings to remove the non-UTF8 character
    const clippingsFiltered = clippingsRaw.replace(this.nonUtf8, "");

    // split clippings using splitter regex
    const clippingsSplit = clippingsFiltered.split(this.splitter);

    // parse clippings using regex
    for (let i = 0; i < clippingsSplit.length - 1; i++) {
      const clipping = clippingsSplit[i];

      const regexHighlight = new RegExp(this.regexHighlight.source);
      const matchHighlight = regexHighlight.exec(clipping);

      const regexNote = new RegExp(this.regexNote.source);
      const matchNote = regexNote.exec(clipping);

      const regexBookmark = new RegExp(this.regexBookmark.source);
      const matchBookmark = regexBookmark.exec(clipping);

      this.addToClippingsArray("highlight", matchHighlight);
      this.addToClippingsArray("note", matchNote);
      this.addToClippingsArray("bookmark", matchBookmark);
    }
  };

  /* Wrapper method to process clippings */
  processClippings = (): GroupedClipping[] => {
    this.parseClippings();
    this.groupClippings();
    this.exportGroupedClippings();
    this.printStats();
    return this.groupedClippings;
  };
}
