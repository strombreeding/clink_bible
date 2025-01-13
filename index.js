const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const { bibles } = require("./const");

console.log(bibles);

const urlData = {
  code: "",
  maxChapter: "",
  name: "",
  maxVerse: 0,
};

const changeUrlData = (arr) => {
  urlData.name = arr[0];
  urlData.code = arr[1];
  urlData.maxChapter = arr[2];
};

const getSource = async (bibles, isOldTestament, page) => {
  const chapterList = [];
  const verseList = [];
  for (let i = 0; i < bibles.length; i++) {
    changeUrlData(bibles[i]);
    const url = `https://www.bskorea.or.kr/KNT/index.php?version=d7a4326402395391-01&abbr=engKJVCPB&chapter=${urlData.code}.${urlData.maxChapter}`;
    await page.goto(url);
    await page.waitForSelector("[data-verse-org-ids]");
    const chapterData = {
      name: urlData.name,
      translation: "새한글",
      isOldTestament,
      prevChapter: null,
      nextChapter: null,
      chapter: i + 1,
      customId: `SAEHAN-${urlData.code}-${i + 1}@`,
    };
    chapterList.push(chapterData);

    // 벌스구하기

    // 여기서부터 변환하라

    const verseData = await page.evaluate(
      (urlData, chapterData) => {
        const elements = document.querySelectorAll("[data-verse-org-ids]");
        const maxVerse =
          elements[elements.length - 1].dataset.verseOrgIds.split(".")[2];

        for (let verseCnt = 1; verseCnt <= maxVerse; verseCnt++) {
          const filteredElements = Array.from(elements).filter(
            (el) =>
              el.dataset.verseOrgIds ===
              `${urlData.code}.${urlData.maxChapter}.${verseCnt}`
          );

          let verseText = "";
          //   절이 여러개로 나눠져있고 0번째는 무조건 절의 이름이니 빼야함
          filteredElements.forEach((index, item) => {
            if (index > 0) {
              verseText += $(item).text();
            }
          });
          const verseObj = {
            customId: `${chapterData.customId}:${verseCnt}`,
            chapterId: chapterData.customId,
            index: verseCnt,
            content: verseText,
            markedUsers: [],
          };

          return verseObj;
        }
      },
      urlData,
      chapterData
    );
    console.log(verseData);
    verseList.push(verseData);
  }

  return { chapterList, verseList };
};

const main = async () => {
  const browser = await puppeteer.launch({
    headless: "false",
    defaultViewprot: null,
  });

  const page = await browser.newPage();

  const oldTestament = await getSource(bibles[0], true, page);
  const newTestament = await getSource(bibles[1], false, page);
  console.log(oldTestament);
};

main();
