const myBtn = document.querySelector("#btn");
const h1 = document.querySelector("h1");
const input = document.querySelector("input#title-input");
const search_output = document.querySelector("#search_output");
const preview_output = document.querySelector("#preview_output");
const whiteButton = document.querySelector("#white");
const fontSizeInput = document.querySelector("#fontSize");
const fontWeightBtn = document.querySelector("#bold");
const darkModeToggle = document.querySelector("input#dark_mode_input");
const deepModeToggle = document.querySelector("input#deep_mode_input");
const slideScreen = document.querySelector("#slide-screen");

let keySequence = [];
document.addEventListener("keydown", function (event) {
  const key = event.key;
  const focusedElementType = document.activeElement.tagName.toLowerCase();

  // escape focus
  if (key === "Escape") {
    // Get the currently focused element
    const focusedElement = document.activeElement;

    // Remove focus from the currently focused element
    focusedElement.blur();
  }

  // Check if the focused element is an input field or a number field
  if (
    focusedElementType === "input" &&
    (document.activeElement.type === "text" ||
      document.activeElement.type === "number")
  ) {
    return; // Do nothing if the focused element is an input field
  }

  // Check if the pressed key is a number
  if (!isNaN(key)) {
    // Add the pressed key to the sequence
    keySequence.push(key);

    // Display the key sequence in the slide screen
    slideScreen.textContent = keySequence.join("");

    // Reset the sequence every 3 digits
    if (keySequence.length === 4) {
      // Reset the sequence
      keySequence = [];
      // Clear the slide screen
      slideScreen.textContent = "";
    }

    // Prevent default behavior
    event.preventDefault();
  } else if (event.keyCode === 13) {
    // Check if the pressed key is Enter
    // Check if there's content in the slide screen
    let bigElement = document.querySelector(".big");
    if (slideScreen.textContent.trim() == "" && bigElement) {
      let activeSlide = document.querySelector("#preview_output .active");
      console.log(!activeSlide);
      console.log(bigElement.classList.contains("active"));
      if (bigElement.classList.contains("selectedSong") && !activeSlide) {
        console.log("here");
        setTimeout(() => {
          bigElement.click();
        }, 200);
      }
    } else if (slideScreen.textContent.trim() !== "") {
      // Log the content
      console.log(slideScreen.textContent.trim());
      const numberPressed = parseInt(slideScreen.textContent.trim());
      // console.log(numberPressed);

      let element = document.querySelector(
        `[data-verseNumber="${numberPressed}"]`
      );
      // if (!element) return;
      // console.log(element);
      // const elements = document.querySelector(".song-preview").children;
      // for (let i = 0; i < elements.length; i++) {
      //   elements[i].classList.remove("active");
      // }

      // element.classList.add("active");
      // ipcRenderer.send("update-song-window", element.innerHTML);
      if (element) {
        const elements = document.querySelector(".song-preview").children;

        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.remove("active");
        }

        element.classList.add("active");
        newSlide(element.innerHTML);
      }

      keySequence = [];
      // Clear the slide screen
      slideScreen.textContent = "";
    }
  }
});

let delay = 50;
whiteButton.addEventListener("click", () => {
  // newSlide("");
  pause();
});

darkModeToggle.addEventListener("change", () => {
  window.myCustomAPI.toggleDarkMode();
});

deepModeToggle.addEventListener("change", (e) => {
  console.log(e.target.checked);
  if (e.target.checked) {
    // delay = 350;
    debouncedSearch = debounce(searchAndDisplayResults, 350);
  } else {
    // delay = 100;
    debouncedSearch = debounce(searchAndDisplayResults, 50);
  }
  console.log(delay);
  debouncedSearch(input.value);
  window.myCustomAPI.flipSearchingMode();
});

fontWeightBtn.addEventListener("click", () => {
  window.myCustomAPI.updateFontWeight();
  fontWeightBtn.classList.toggle("bold");
});

fontSizeInput.addEventListener("change", (e) => {
  window.myCustomAPI.updateFontSize(e.target.value);
});

let res;
// input.addEventListener("input", async (e) => {
//   const newTitle = e.target.value;
//   //   window.myCustomAPI.changeTitleTo(newTitle);
//   let res = await window.myCustomAPI.searchTerm(newTitle);
//   console.log(res);
//   search_output.innerHTML = generateHTML(res);
// });

async function searchAndDisplayResults(term) {
  res = await window.myCustomAPI.searchTerm(term);
  // console.log(res);
  let containsDigit = /\d/.test(term);
  console.log("containsDigit: ", containsDigit);

  if (containsDigit) {
    // display bible
    search_output.innerHTML = generateBibleHTML(res, term);
  } else {
    // display songs
    search_output.innerHTML = generateHTML(res);
  }
  console.log(res);
}

// Use debounce to delay the search function
let debouncedSearch = debounce(searchAndDisplayResults, delay);

// for testing
// setTimeout(() => {
//   input.value = "ان اشتياق القلب زاد";

//   // Create a new event
//   const inputEvent = new Event("input", {
//     bubbles: true,
//     cancelable: true,
//   });

//   input.dispatchEvent(inputEvent);
// }, 1000);

// let clickDev = new Event("click", {
//   bubbles: true,
//   cancelable: true,
// });

// setTimeout(() => {
//   let son = document.querySelector(".big");
//   son.dispatchEvent(clickDev);
// }, 2500);
// setTimeout(() => {
//   let ver = document.querySelector(".slide");
//   ver.dispatchEvent(clickDev);
// }, 2800);
// end testing

// Attach the debouncedSearch function to the input event
input.addEventListener("input", function (e) {
  let term = e.target.value;
  if (term.length < 3) return (search_output.innerHTML = "");
  debouncedSearch(term);
});

input.addEventListener("keydown", function (event) {
  // Check if the pressed key is 'Enter' (key code 13)
  if (event.keyCode === 13) {
    // Log "Enter" to the console
    console.log("Enter");
    let bigElement = document.querySelector(".big");

    // Check if the bigElement exists
    if (bigElement) {
      // Dispatch a click event to the big element twice
      bigElement.click();
    }

    // Remove focus from the input field
    input.blur(); // This removes focus from the input
    // Stop the event from bubbling up to the document
    event.stopPropagation();
  }
});

// input.addEventListener("keydown", function (e) {
//   if (e.key === "Enter") {
//     const term = e.target.value;
//     searchAndDisplayResults(term);
//   }
// });

// input.addEventListener("input", (e) => {
//   //   console.log(e.target.value);
//   search_output.textContent = e.target.value;
// });

search_output.addEventListener("click", (e) => {
  let clickedSong = e.target.closest(".song");
  let clickedChapter = e.target.closest(".chapter");
  // console.log("clickedSong: " + clickedSong);
  // console.log("clickedChapter: " + clickedChapter);
  // if not song then ignore the click

  if (clickedSong) {
    toggleFontSizeInput(false);
    // get info about the song
    let ref = clickedSong.getAttribute("data-ref");
    let currentSong = document.querySelector("#preview_output .song-title");
    let currentSongRef = 0;

    // if there is a current song in preview, get it's refIndex
    if (currentSong) {
      currentSongRef = currentSong.getAttribute("data-ref");
    }

    // mark the selected song with red border
    const elements = document.querySelectorAll(".big");

    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("selectedSong");
    }

    // if the selected song already is in preview, start showing the first slide
    clickedSong.classList.add("selectedSong");
    if (ref && currentSongRef && ref == currentSongRef) {
      let firstSlide = document.querySelector(".slide");
      if (firstSlide) {
        firstSlide.classList.add("active");
        newSlide(firstSlide.innerHTML);
      }
      return;

      // if the selected song is not in preview, add it to preview
    } else {
      const targetedSong = res.find((song) => song.refIndex == ref);
      preview_output.innerHTML = previewSelectedSong(
        targetedSong.item,
        targetedSong.refIndex
      );
      newSlide("");
    }
  } else if (clickedChapter) {
    toggleFontSizeInput(true);
    let ref = clickedChapter.getAttribute("data-ref");
    let currentSong = document.querySelector("#preview_output .song-title");
    let currentSongRef = 0;

    // if there is a current song in preview, get it's refIndex
    if (currentSong) {
      currentSongRef = currentSong.getAttribute("data-ref");
    }

    console.log(res);
    // mark the selected song with red border
    const elements = document.querySelectorAll(".big");

    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("selectedSong");
    }

    // if the selected song already is in preview, start showing the first slide
    clickedChapter.classList.add("selectedSong");
    if (ref && currentSongRef && ref == currentSongRef) {
      let firstSlide = document.querySelector(".slide");
      if (firstSlide) {
        firstSlide.classList.add("active");
        newSlide(firstSlide.innerHTML);
      }
      return;

      // if the selected song is not in preview, add it to preview
    } else {
      const targetedSong = res.find((song) => song.refIndex == ref);
      console.log(targetedSong);
      preview_output.innerHTML = previewSelectedChapter(
        targetedSong.item,
        targetedSong.refIndex
      );
      newSlide("");
    }
  }
});

preview_output.addEventListener("click", (e) => {
  let element = e.target.closest(".verse, .chorus, .bible-verse");

  if (element) {
    const elements = document.querySelector(".song-preview").children;

    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("active");
    }

    element.classList.add("active");
    newSlide(element.innerHTML);
  }
});

// up and down function
// ////////////////////////
// ////////////////////////
document.addEventListener("keydown", (e) => {
  // ignore changing the font size key strokes
  if (e.target.id == "fontSize") {
    return;
  }
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    // check for first and last slide
    const previewOutput = document.getElementById("preview_output");
    const activeElement = previewOutput.querySelector(".active");
    if (activeElement) {
      const siblings = Array.from(activeElement.parentElement.children);
      const position = siblings.indexOf(activeElement);
      const isLast = position === siblings.length - 1;

      if (
        (isLast && e.keyCode === 40) ||
        (position === 0 && e.keyCode === 38)
      ) {
        return; // Do nothing for first and last slide
      } else {
        // move slide
        const elements = document.querySelector(".song-preview").children;
        let currentActiveIndex = -1;

        for (let i = 0; i < elements.length; i++) {
          if (elements[i].classList.contains("active")) {
            currentActiveIndex = i;
          }
        }

        // Remove the active class outside the loop
        if (currentActiveIndex !== -1) {
          elements[currentActiveIndex].classList.remove("active");
        }

        if (e.keyCode === 38 && currentActiveIndex > 0) {
          // Up arrow
          elements[currentActiveIndex - 1].classList.add("active");
          newSlide(elements[currentActiveIndex - 1].innerHTML);
        } else if (
          e.keyCode === 40 &&
          currentActiveIndex < elements.length - 1
        ) {
          // Down arrow
          elements[currentActiveIndex + 1].classList.add("active");

          newSlide(elements[currentActiveIndex + 1].innerHTML);
        }
      }
    }
  }
});
// ////////////////////////
// ////////////////////////

function truncate(str, max_length) {
  return str.length > max_length ? str.slice(0, max_length - 1) + "…" : str;
}

function generateHTML(dataArray, truncateLimit = 50) {
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
      </div>
    `;
    })
    .join("");

  return htmlData;
}

function generateBibleHTML(dataArray, term, truncateLimit = 50) {
  // Ensure the input is an array
  if (!Array.isArray(dataArray)) {
    console.error("Input must be an array.");
    console.log(dataArray);
    console.log(term);
    return "";
  }

  // Limit the results to the first 10 elements
  // let trimmedResults = dataArray.slice(0, 100);

  // Generate HTML for each element
  // let containsDigit = /\d/.test(term);

  let htmlData = dataArray
    .filter(function (element) {
      let { item } = element;
      let { chapter_number } = item;
      let searched_numbers = term.match(/\d+$/);
      let numbers = searched_numbers ? searched_numbers.map(Number) : 0;
      if (searched_numbers) {
        if (!searched_numbers[0] || chapter_number != searched_numbers[0]) {
          return false; // skip
        }
      }
      return true;
    })
    .map((element) => {
      let { item, refIndex, score } = element;
      let { chapter_name, chapter_number, verses } = item;

      let titleHTML = chapter_name ? `<h2>${chapter_name}</h2>` : "";

      let versesHTML = verses
        ? `<div class="verses">1- ${
            verses["1"] + "2- " + verses["2"] + " ..."
          }</div>`
        : "";

      return `
      <div class="big chapter" data-ref="${refIndex}" dir="rtl">
        ${titleHTML}
        ${versesHTML}
      </div>
    `;
    })
    .join("");

  return htmlData;
}

function previewSelectedChapter(
  { chapter_name, chapter_book, chapter_number, verses },
  refIndex
) {
  let chapter_number_ar = new Intl.NumberFormat("ar-EG").format(chapter_number);

  let html = `<h4 class="song-title" data-ref="${refIndex}">${
    chapter_book + "  " + chapter_number_ar
  }</h4>`;
  html += `<div class="song-preview">`;
  console.log(verses);

  for (const [key, value] of Object.entries(verses)) {
    console.log(`Key: ${key}, Value: ${value}`);
  }

  for (const [key, value] of Object.entries(verses)) {
    console.log(value);

    // add verse number for the first line in a verse
    html += `<div class="bible-verse slide" data-verseNumber="${key}">
          <span class="verseNumber">${new Intl.NumberFormat("ar-EG").format(
            key
          )}</span>
          <div>
          ${value}
          </div>
          </div>`;
  }

  html += `</div>`;
  return html;
}

// preview selected song
function previewSelectedSong({ title, chorus, verses, chorusFirst }, refIndex) {
  let html = `<h4 class="song-title" data-ref="${refIndex}">${title}</h4>`;
  html += `<div class="song-preview">`;
  const replaceLineBreaks = (text) => text.replace(/\n/g, "<br>");

  if ((chorusFirst && chorus && chorus.length > 0) || verses.length == 0) {
    chorus.forEach((line) => {
      html += `<div class="chorus slide">${replaceLineBreaks(line)}</div>`;
    });
  }

  if (verses && verses.length > 0) {
    for (let verseIndex = 0; verseIndex < verses.length; verseIndex++) {
      const verse = verses[verseIndex];

      for (let lineIndex = 0; lineIndex < verse.length; lineIndex++) {
        const line = verse[lineIndex];

        // add verse number for the first line in a verse
        let verseNumber = "";
        let arabicNumber = "";
        if (lineIndex == 0) {
          verseNumber = verseIndex + 1;
          arabicNumber = new Intl.NumberFormat("ar-EG").format(verseNumber);
        }
        html += `<div class="verse slide" data-verseNumber="${verseNumber}">
          <span class="verseNumber">${arabicNumber}</span>
          <div>
          ${replaceLineBreaks(line)}
          </div>
          </div>`;
      }

      if (chorus && chorus.length > 0) {
        for (let chorusIndex = 0; chorusIndex < chorus.length; chorusIndex++) {
          const chorusLine = chorus[chorusIndex];
          let chorusSymbol = "";
          if (chorusIndex == 0) {
            chorusSymbol = "ق";
          }
          html += `<div class="chorus slide">
          <span class="chorusSymbol">${chorusSymbol}</span>
          ${replaceLineBreaks(chorusLine)}
          </div>`;
        }
      }
    }
  }

  html += `<div class="chorus slide"></div>`;

  html += `</div>`;
  return html;
}

// debounce function
function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function countLineBreaks(text) {
  const lineBreakRegex = /\n/g;
  const matches = text.match(lineBreakRegex);
  return matches ? matches.length : 0;
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    }
  };
}

// all ctrl shortcuts
document.addEventListener("keydown", (e) => {
  // console.log(e);
  if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
    // The user pressed Shift + a number (1-9)
    const numberPressed = parseInt(e.key);
    // console.log(numberPressed);

    let element = document.querySelector(
      `[data-verseNumber="${numberPressed}"]`
    );
    // if (!element) return;
    // console.log(element);
    // const elements = document.querySelector(".song-preview").children;
    // for (let i = 0; i < elements.length; i++) {
    //   elements[i].classList.remove("active");
    // }

    // element.classList.add("active");
    // ipcRenderer.send("update-song-window", element.innerHTML);
    if (element) {
      const elements = document.querySelector(".song-preview").children;

      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("active");
      }

      element.classList.add("active");
      newSlide(element.innerHTML);
    }
  }

  if (e.ctrlKey && e.code == "KeyF") {
    // console.log(window.scrollY);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    setTimeout(() => {
      input.focus();
      input.select();
    }, window.scrollY / (window.scrollY < 4000 ? 3 : 15));
  }

  if (e.ctrlKey && e.code == "KeyW") {
    // newSlide("");
    pause();
  }
});

function pause() {
  let active = document.querySelector(".active");
  console.log(active.innerHTML);
  if (!active) return;
  if (active.classList.contains("pause")) {
    active.click();
  } else {
    active.classList.add("pause");
    window.myCustomAPI.updateSongWindow("");
  }
}

function newSlide(html) {
  // console.log(html);
  let paused = document.querySelector(".pause");
  if (paused) paused.classList.remove("pause");
  console.log(html.length);
  // if it's a bible verse, add the chapter title
  if (
    (document.querySelector(".slide").classList.contains("bible-verse") &&
      document.querySelector(".slide.active")) ||
    html.legnth == 0
  ) {
    let chapter_title = document.querySelector(".song-title").outerHTML;
    let combined_html = `<div class="container bible-container">
    <div class="head bible-head">
    ${chapter_title}
    </div>
    
    <div class="body bible-body">
    ${html}
    </div>
    </div>`;
    // console.log(combined_html);
    window.myCustomAPI.updateSongWindow(combined_html, true);
  } else {
    let combined_html = `<div class="container song-container">
    <div class="body song-body">
    ${html}
    </div>
    </div>`;
    window.myCustomAPI.updateSongWindow(combined_html, false);
  }
}

let toggleFontSizeInput = (isBible) => {
  if (isBible) {
    // Disable the input field
    fontSizeInput.disabled = true;

    // Change cursor style to not-allowed
    fontSizeInput.style.cursor = "not-allowed";

    // Adjust opacity to visually indicate disabled state
    fontSizeInput.style.opacity = "0.5"; // Example: Reduced opacity (50%)
  } else {
    // Enable the input field
    fontSizeInput.disabled = false;

    // Reset cursor style
    fontSizeInput.style.cursor = "pointer";

    // Reset opacity
    fontSizeInput.style.opacity = "1"; // Reset opacity to normal
  }
};
