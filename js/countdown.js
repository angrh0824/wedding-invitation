// カウントダウン機能
document.addEventListener('DOMContentLoaded', function() {
    // 結婚式の日付を設定（2025年8月31日）
    const weddingDate = new Date('2025-08-31T00:00:00+09:00');
    
    // カウントダウン要素
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    // カウントダウン関数
    function updateCountdown() {
        // 現在の日時
        const currentDate = new Date();
        
        // 残り時間（ミリ秒）
        const diff = weddingDate - currentDate;
        
        // 日付が過ぎた場合
        if (diff <= 0) {
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            return;
        }
        
        // 残り日数、時間、分、秒を計算
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // 表示を更新
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    // 初回実行
    updateCountdown();
    
    // 1秒ごとに更新
    setInterval(updateCountdown, 1000);
});
