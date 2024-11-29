// Google 表格 JSON 公開 URL
const JSON_URL = 'https://docs.google.com/spreadsheets/d/1F3Azo3zfceq73CQwMZv0q-C-QMQnDsF82CMVq2sVZvo/gviz/tq?tqx=out:json'; // 替換為你的表格 ID

// 從 Google 表格中獲取數據
async function fetchData() {
    try {
        const response = await fetch(JSON_URL);
        const text = await response.text();

        // 清理 Google 表格 JSON 格式
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const jsonData = JSON.parse(jsonString);

        // 解析數據表中的行
        const rows = jsonData.table.rows;
        const votes = { '交大-李東翰': 0, '清大-蕭善謙': 0 }; // 預設清大、交大票數為 0

        // 計算每個選項的票數
        rows.forEach(row => {
            const choice = row.c[1]?.v; // 假設選項在第二列
            if (choice === '交大-李東翰' || choice === '清大-蕭善謙') {
                votes[choice] = (votes[choice] || 0) + 1; // 累加票數
            }
        });

        // 顯示投票數在控制台
        console.log(`清大票數: ${votes['清大']}`);
        console.log(`交大票數: ${votes['交大']}`);

        return votes;
    } catch (error) {
        console.error('無法獲取數據:', error);
        return {};
    }
}

let voteChart;

// 渲染圖表
async function renderChart() {
    const votes = await fetchData();

    // 提取選項和票數
    // const labels = Object.keys(votes); // X 軸的選項名稱
    const counts = Object.values(votes); // Y 軸的票數
    
    if(!voteChart) {  // init chart
        // 確認 canvas 的上下文
        const ctx = document.getElementById('voteChart');
        ctx.style.height = '600px'
        // 繪製圖表
        voteChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['交大', '清大'],
                datasets: [{
                    label: '投票數',

                    data: counts,
                    backgroundColor: ['rgba(355, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
                    borderColor: ['rgba(355, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
                    borderWidth: 5
                }]
            },
            options: {
                indexAxis: 'y',  // horizontal bar chart
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 35,  // size of x-axis letter
                                weight: 'bold'
                            }
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 35, // size of y-axis letter
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 0,
                            font: {
                                size: 35, // 圖例字體大小
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        bodyFont: {
                            size: 35 // 提示文字字體大小
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'right',
                        formatter: (value) => value, // 顯示數值
                        font: {
                            size: 50, // 數值標籤字體大小
                            weight: 'bold'
                        },
                        color: '#FF0000'
                    }
                }
            },
            plugins: [
                {
                    id: 'datalabels',
                    beforeDraw(chart) {
                        const ctx = chart.ctx;
                        const datasets = chart.data.datasets[0].data;

                        ctx.save();
                        chart.data.datasets[0].data.forEach((value, index) => {
                            const meta = chart.getDatasetMeta(0);
                            const bar = meta.data[index];
                            const x = bar.tooltipPosition().x + 35; // 微調位置
                            const y = bar.tooltipPosition().y;
                            ctx.fillStyle = 'black';
                            ctx.font = 'bold 35px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText(`${value}`, x, y);
                        });
                    }
                }
            ]
        });
    }
    else {  // chart exist
        voteChart.data.datasets[0].data = counts;
        voteChart.data.labels = labels;
        const maxVote = Math.max(...counts);
        voteChart.options.scales.max = Math.ceil(maxVote * 1.2);
        voteChart.update();
    }
    
}

// 初始化圖表並每隔 5 秒刷新
renderChart();
setInterval(renderChart, 100); // 每 5 秒刷新一次