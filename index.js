const fs = require("fs");
const puppeteer = require("puppeteer");
const { bibles } = require("./const");
// 시편부터 split: ,1

const changenewBibleData = (arr) => {
  return {
    name: arr[0],
    code: arr[1],
    maxChapter: arr[2],
  };
};

const getSource = async (bibles, isOldTestament, page) => {
  const chapterList = [];
  let verseList = [];
  for (let i = 0; i < bibles.length; i++) {
    const newBibleData = changenewBibleData(bibles[i]);
    console.log(newBibleData);
    for (
      let nowChapter = 1;
      nowChapter <= newBibleData.maxChapter;
      nowChapter++
    ) {
      const url = `https://www.bskorea.or.kr/KNT/index.php?version=d7a4326402395391-01&abbr=engKJVCPB&chapter=${newBibleData.code}.${nowChapter}`;
      await page.goto(url);
      await page.waitForSelector("#content");

      const chapterData = {
        name: newBibleData.name,
        translation: "새한글",
        isOldTestament,
        prevChapter: null,
        nextChapter: null,
        chapter: nowChapter,
        customId: `SAEHAN-${newBibleData.code}-${nowChapter}@`,
      };
      chapterList.push(chapterData);

      // 벌스구하기

      // 여기서부터 변환하라

      const verseData = await page.evaluate(
        (newBibleData, chapterData, nowChapter) => {
          const list = [];
          const elements = document.querySelectorAll("[data-verse-id]");
          const maxVerse =
            elements[elements.length - 1].dataset.verseId.split(".")[2];
          for (let verseCnt = 1; verseCnt <= maxVerse; verseCnt++) {
            const filteredElements = Array.from(elements).filter(
              (el) =>
                el.dataset.verseId ===
                `${newBibleData.code}.${nowChapter}.${verseCnt}`
            );
            let verseText = "";
            //   절이 여러개로 나눠져있고 0번째는 무조건 절의 이름이니 빼야함
            for (
              let verseDetail = 0;
              verseDetail < filteredElements.length;
              verseDetail++
            ) {
              if (verseDetail > 0) {
                verseText += filteredElements[verseDetail].textContent;
              }
            }

            const verseObj = {
              customId: `${chapterData.customId}:${verseCnt}`,
              chapterId: chapterData.customId,
              index: verseCnt,
              content: verseText,
              markedUsers: [],
            };

            list.push(verseObj);
          }
          return list;
        },
        newBibleData,
        chapterData,
        nowChapter
      );

      verseList = [...verseList, ...verseData];
    }
  }
  await page.close();
  return { chapterList, verseList };
};

const finish = (list) => {
  const result = list.map((item, index) => {
    item.prevChapter = index === 0 ? null : list[index - 1].customId;
    item.nextChapter =
      list.length - 1 === index ? null : list[index + 1].customId;
  });
  return result;
};
const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ["--window-size=1920,1080", "--disable-notifications"],
  });
  const page1 = await browser.newPage();
  const page2 = await browser.newPage();
  const page3 = await browser.newPage();
  const page4 = await browser.newPage();
  const page5 = await browser.newPage();
  const page6 = await browser.newPage();
  const page7 = await browser.newPage();
  const page8 = await browser.newPage();
  const page9 = await browser.newPage();
  //   await page.setViewport({
  //     width: 1080,
  //     height: 1080,
  //   });

  const [
    oldTestament1,
    oldTestament2,
    oldTestament3,
    oldTestament4,
    oldTestament5,
    oldTestament6,
    oldTestament7,
    newTestament1,
    newTestament2,
  ] = await Promise.all([
    getSource(bibles[0], true, page1),
    getSource(bibles[1], true, page2),
    getSource(bibles[2], true, page3),
    getSource(bibles[3], true, page4),
    getSource(bibles[4], true, page5),
    getSource(bibles[5], true, page6),
    getSource(bibles[6], true, page7),
    getSource(bibles[7], false, page8),
    getSource(bibles[8], false, page9),
  ]);
  //   const oldTestament = await getSource(bibles[0], true, page);
  //   const newTestament = await getSource(bibles[1], false, page);
  const chapters = JSON.stringify(
    finish([
      ...oldTestament1.chapterList,
      ...oldTestament2.chapterList,
      ...oldTestament3.chapterList,
      ...oldTestament4.chapterList,
      ...oldTestament5.chapterList,
      ...oldTestament6.chapterList,
      ...oldTestament7.chapterList,
      ...newTestament1.chapterList,
      ...newTestament2.chapterList,
    ]),
    null,
    2
  );
  const verses = JSON.stringify(
    [
      ...oldTestament1.verseList,
      ...oldTestament2.verseList,
      ...oldTestament3.verseList,
      ...oldTestament4.verseList,
      ...oldTestament5.verseList,
      ...oldTestament6.verseList,
      ...oldTestament7.verseList,
      ...newTestament1.verseList,
      ...newTestament2.verseList,
    ],
    null,
    2
  );
  fs.writeFileSync("chapter.json", chapters);
  fs.writeFileSync("verse.json", verses);
};

main();
