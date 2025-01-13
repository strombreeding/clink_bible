const fs = require("fs");
const puppeteer = require("puppeteer");
const { bibles } = require("./const");
// 시편부터 split: ,1

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
  let verseList = [];
  for (let i = 0; i < bibles.length; i++) {
    changeUrlData(bibles[i]);
    console.log(urlData);
    for (let nowChapter = 1; nowChapter <= urlData.maxChapter; nowChapter++) {
      const url = `https://www.bskorea.or.kr/KNT/index.php?version=d7a4326402395391-01&abbr=engKJVCPB&chapter=${urlData.code}.${nowChapter}`;
      await page.goto(url);
      await page.waitForSelector("#content");

      const chapterData = {
        name: urlData.name,
        translation: "새한글",
        isOldTestament,
        prevChapter: null,
        nextChapter: null,
        chapter: nowChapter,
        customId: `SAEHAN-${urlData.code}-${nowChapter}@`,
      };
      chapterList.push(chapterData);

      // 벌스구하기

      // 여기서부터 변환하라

      const verseData = await page.evaluate(
        (urlData, chapterData, nowChapter) => {
          const list = [];
          const elements = document.querySelectorAll("[data-verse-id]");
          const maxVerse =
            elements[elements.length - 1].dataset.verseId.split(".")[2];
          for (let verseCnt = 1; verseCnt <= maxVerse; verseCnt++) {
            const filteredElements = Array.from(elements).filter(
              (el) =>
                el.dataset.verseId ===
                `${urlData.code}.${nowChapter}.${verseCnt}`
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
        urlData,
        chapterData,
        nowChapter
      );

      verseList = [...verseList, ...verseData];
    }
  }

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
    headless: true,
    // args: ["--window-size=1920,1080", "--disable-notifications"],
  });
  const page1 = await browser.newPage();
  const page2 = await browser.newPage();
  //   await page.setViewport({
  //     width: 1080,
  //     height: 1080,
  //   });

  const [oldTestament, newTestament] = await Promise.all([
    (getSource(bibles[0], true, page1), getSource(bibles[1], false, page2)),
  ]);
  //   const oldTestament = await getSource(bibles[0], true, page);
  //   const newTestament = await getSource(bibles[1], false, page);
  const chapters = JSON.stringify(
    finish([...oldTestament.chapterList, ...newTestament.chapterList]),
    null,
    2
  );
  const verses = JSON.stringify(
    [...oldTestament.verseList, ...newTestament.verseList],
    null,
    2
  );
  fs.writeFileSync("chapter.json", chapters);
  fs.writeFileSync("verse.json", verses);
};

main();
