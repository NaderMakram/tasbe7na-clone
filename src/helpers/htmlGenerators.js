function truncate(str, max_length) {
  return str.length > max_length ? str.slice(0, max_length - 1) + "…" : str;
}

export function generateHTML(dataArray, truncateLimit = 50) {
  // Ensure the input is an array
  if (!Array.isArray(dataArray)) {
    console.error("Input must be an array.");
    return "";
  }

  // Limit the results to the first 10 elements
  let trimmedResults = dataArray.slice(0, 10);

  // Generate HTML for each element
  let htmlData = trimmedResults
    .map((element) => {
      // Extract information from the object
      let { item, refIndex } = element;
      let { title, chorus, verses } = item;

      // Generate HTML for title
      let titleHTML = title ? `<h2>${title}</h2>` : "";

      // Generate HTML for chorus if it exists
      let chorusHTML = chorus
        ? `<div class="chorus">(ق) ${truncate(
            chorus.map((line) => `${line}`).join(""),
            50
          )}</div>`
        : "";

      // Generate HTML for verses if they exist
      let versesHTML = verses
        ? `<div class="verses">1- ${
            verses[0] && typeof verses[0][0] == "string"
              ? truncate(verses[0][0], truncateLimit)
              : ""
          }</div>`
        : "";

      // Combine everything into a single HTML block
      return `
        <div class="big song" data-ref="${refIndex}">
          ${titleHTML}
          ${chorusHTML}
          ${versesHTML}
          <img src="./img/plus.svg" class="plus hide" alt="plus"/>
        </div>
      `;
    })
    .join("");

  return htmlData;
}

export function generateBibleHTML(dataArray, term, truncateLimit = 50) {
  // Ensure the input is an array
  if (!Array.isArray(dataArray)) {
    console.error("Input must be an array.");
    console.log(dataArray);
    console.log(term);
    return "";
  }

  term = term.replace(/^\d+\s*/, ""); // Remove leading numbers and spaces

  let match = term.match(/(\d+)(?:\s*[:\s]\s*(\d+))?$/);

  let searched_chapter;
  let searched_verse;
  if (match) {
    searched_chapter = match[1];
    searched_verse = match[2] || null;
  } else {
    console.log("No match found");
  }
  console.log("Chapter:", searched_chapter);
  console.log("Verse:", searched_verse);

  let htmlData = dataArray
    .filter(function (element) {
      let { item } = element;
      let { chapter_number } = item;

      // ظظظظظظظظظظظظظظظظظ
      console.log(`searched_chapter: ${searched_chapter}`);
      console.log(`searched_verse: ${searched_verse}`);

      // ظظظظظظظظظظظظظظظظظ

      console.log(`term: ${term}`);
      console.log(`searched_numbers: ${typeof searched_chapter}`);

      // console.log(searched_numbers)
      if (searched_chapter) {
        if (searched_chapter == "0") {
          return true;
        } else if (!searched_chapter || chapter_number != searched_chapter) {
          return false; // skip
        }
      }
      return true;
    })
    .map((element) => {
      console.log(`filtered element: ${{ element }}`);
      let { item, refIndex, score } = element;
      let { chapter_name, chapter_number, verses } = item;

      let titleHTML = chapter_name
        ? `<h2>${chapter_name} ${
            searched_verse ? `: ${searched_verse}` : ""
          }</h2>`
        : "";

      let versesHTML = searched_verse
        ? `<div class="verses">${verses[searched_verse]}</div>`
        : `<div class="verses">1- ${
            verses["1"] + "2- " + verses["2"] + " ..."
          }</div>`;

      return `
        <div class="big chapter" data-ref="${refIndex}" dir="rtl">
          ${titleHTML}
          ${versesHTML}
          <img src="./img/plus.svg" class="plus hide" alt="plus"/>
        </div>
      `;
    })
    .join("");

  console.log(htmlData.length);
  if (htmlData == 0) {
    htmlData = `
    <div class="note big bold">
      لو بتدور في الكتاب المقدس</br>
      اكتب الشاهد بالاختصار ورقم الأصحاح فقط</br>
      تك 3</br>
      1 صم 12</br>
      <img src="./img/warning.png" class="warning icon" alt="plus">
    </div>
    `;
  }

  return htmlData;
}
