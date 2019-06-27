testdata.xlsx: 目前我使用的測資(工作表一)，第一row為必須增加的欄位: ID, place, time, loc, lng, content  (content的地方應該還會再做調整)

index.html: 包含了檔案上傳 後分類 table chart

parse_excel.js: 處理使用者上傳的excel 並讓使用者選取表單

share_model.js: 處理得到的excel data 並依據'地名','經度','緯度','時間'做分類 (剩下的當成item, 此處尚待修改)；另外也能用拿到的條件來計算篩選結果回傳給其他元件

post_classify.js: 將得到的資料做後分類並依據數量排序，按下執行後會送出篩選條件給shared model

data_table.js: 將資料以表格呈現，篩選後的結果目前以highlight方法強調

draw_chart.js: 目前只有將使用者上傳的資料做分類並簡單的呈現(尚待修改)

