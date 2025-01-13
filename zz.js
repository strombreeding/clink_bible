const puppeteer = require("puppeteer");

const bibles = [
  ["창세기", "GEN", "50"],
  ["출애굽기", "EXO", "40"],
  ["레위기", "LEV", "27"],
  ["민수기", "NUM", "36"],
  ["신명기", "DEU", "34"],
  ["여호수아", "JOS", "24"],
  ["사사기", "JDG", "21"],
  ["룻기", "RUT", "4"],
  ["사무엘상", "1SA", "31"],
  ["사무엘하", "2SA", "24"],
  ["열왕기상", "1KI", "22"],
  ["열왕기하", "2KI", "25"],
  ["역대상", "1CH", "29"],
  ["역대하", "2CH", "36"],
  ["에스라", "EZR", "10"],
  ["느헤미야", "NEH", "13"],
  ["에스더", "EST", "10"],
  ["욥기", "JOB", "42"],
  ["시편", "PSA", "150"],
  ["잠언", "PRO", "31"],
  ["전도서", "ECC", "12"],
  ["아가", "SNG", "8"],
  ["이사야", "ISA", "66"],
  ["예레미야", "JER", "52"],
  ["예레미야애가", "LAM", "5"],
  ["에스겔", "EZK", "48"],
  ["다니엘", "DAN", "12"],
  ["호세아", "HOS", "14"],
  ["요엘", "JOL", "3"],
  ["아모스", "AMO", "9"],
  ["오바댜", "OBA", "1"],
  ["요나", "JON", "4"],
  ["미가", "MIC", "7"],
  ["나훔", "NAM", "3"],
  ["하박국", "HAB", "3"],
  ["스바냐", "ZEP", "3"],
  ["학개", "HAG", "2"],
  ["스가랴", "ZEC", "14"],
  ["말라기", "MAL", "4"],

  ["마태복음", "MAT", "28"],
  ["마가복음", "MRK", "16"],
  ["누가복음", "LUK", "24"],
  ["요한복음", "JHN", "21"],
  ["사도행전", "ACT", "28"],
  ["로마서", "ROM", "16"],
  ["고린도전서", "1CO", "16"],
  ["고린도후서", "2CO", "13"],
  ["갈라디아서", "GAL", "6"],
  ["에베소서", "EPH", "6"],
  ["빌립보서", "PHP", "4"],
  ["골로새서", "COL", "4"],
  ["데살로니가전서", "1TH", "5"],
  ["데살로니가후서", "2TH", "3"],
  ["디모데전서", "1TI", "6"],
  ["디모데후서", "2TI", "4"],
  ["디도서", "TIT", "3"],
  ["빌레몬서", "PHM", "1"],
  ["히브리서", "HEB", "13"],
  ["야고보서", "JAS", "5"],
  ["베드로전서", "1PE", "5"],
  ["베드로후서", "2PE", "3"],
  ["요한일서", "1JN", "5"],
  ["요한이서", "2JN", "1"],
  ["요한삼서", "3JN", "1"],
  ["유다서", "JUD", "1"],
  ["요한계시록", "REV", "22"],
];

const main = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    // args: ["--window-size=1920,1080", "--disable-notifications"],
  });

  const page1 = await browser.newPage();
  await page1.goto(
    "https://www.bskorea.or.kr/KNT/index.php?version=d7a4326402395391-01&abbr=engKJVCPB&chapter=JHN.1"
  );
  await page1.waitForSelector("#select-chapter");

  const zz = await page1.evaluate((bibles) => {
    const aa = document.querySelector("#select-chapter").children.length;
    for (let i = 0; i < aa.length; i++) {
      bibles[i][1] = aa[i].value;
    }
    return bibles;
  }, bibles);
  console.log(zz);
};

main();
