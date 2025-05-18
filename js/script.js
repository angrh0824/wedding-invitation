// js/script.js (★正しいGAS連携バージョン★)

document.addEventListener('DOMContentLoaded', function() {

    // --- ローディング画面制御 ---
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        window.addEventListener('load', () => { loadingScreen.classList.add('hidden'); });
        setTimeout(() => { loadingScreen.classList.add('hidden'); }, 3000);
    }

    // --- Lightbox 初期化 ---
    if (typeof lightbox !== 'undefined') {
        lightbox.option({ 'resizeDuration': 200, 'wrapAround': true, 'fadeDuration': 300, 'imageFadeDuration': 300, 'disableScrolling': true });
    }

    // --- スムーズスクロール ---
    const smoothScrollLinks = document.querySelectorAll('.smooth-scroll, a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            let targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#top') targetId = '#home';
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop;
                window.scrollTo({ top: offsetTop - 60, behavior: 'smooth' });
            }
        });
    });

    // --- Intersection Observer アニメーション ---
    const animatedSections = document.querySelectorAll('.animated-section');
    if (animatedSections.length > 0) {
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        };
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        animatedSections.forEach(section => {
             if (section.closest('.header')) {
                setTimeout(() => observer.observe(section), 300);
             } else {
                observer.observe(section);
             }
        });
    } else {
        document.querySelectorAll('.animated-section').forEach(el => el.style.opacity = '1');
    }

    // --- フォーム処理 (GAS連携バージョン) ---
    const form = document.getElementById('rsvp-form');
    const formStatus = document.getElementById('form-status');
    const attendanceRadios = document.querySelectorAll('input[name="attendance_radio"]'); // ★HTMLのnameに合わせる
    const hiddenAttendanceInput = document.getElementById('attendance'); // ★hidden inputを使用
    const allergyGroup = document.querySelector('.allergy-group');

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★ 必ず！GAS設定時にコピーしたあなたの「ウェブアプリURL」に書き換えてください ★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbyYgnhY0_pSNK1P-gwYHDWxJHP8XQLlNAWb7xT_VJHacxSQYS7cWtDq97n7jvEWJGK7hA/exec'; // ← まだURL未入力とのことなので、後で必ず設定！
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    // 出欠ラジオボタン → アレルギー表示 ＋ hidden input への値設定
    if (attendanceRadios.length > 0 && hiddenAttendanceInput && allergyGroup) {
        attendanceRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                hiddenAttendanceInput.value = this.value; // hidden inputに値を設定
                allergyGroup.style.display = (this.value === 'attend') ? 'block' : 'none';
            });
        });
        // 初期表示
        const initialAttendance = document.querySelector('input[name="attendance_radio"]:checked');
        if (initialAttendance) {
            hiddenAttendanceInput.value = initialAttendance.value; // 初期値も設定
            allergyGroup.style.display = (initialAttendance.value === 'attend') ? 'block' : 'none';
        } else {
            hiddenAttendanceInput.value = ''; // 初期値がなければ空に
            allergyGroup.style.display = 'none';
        }
    } else {
         if (!hiddenAttendanceInput) console.error("Hidden input with ID 'attendance' not found. Please add it back to index.html.");
    }


    if (form && formStatus) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // ★★★ GAS方式ではデフォルト送信をキャンセル ★★★
            formStatus.textContent = '送信中...';
            formStatus.className = '';

            // hidden inputに値が入っているか確認 (出欠選択チェック)
            if (!hiddenAttendanceInput.value) { // hidden inputの値でチェック
                alert('出欠を選択してください。');
                formStatus.textContent = '';
                return;
            }

            // フォームデータを取得 (HTMLのname属性を使用)
            const formData = new FormData(form);

            // バリデーション (nameとemail)
            const name = formData.get('name');
            const email = formData.get('email');
            if (!name || !email) {
                 alert('お名前とメールアドレスは必須です。');
                 formStatus.textContent = '';
                 return;
             }
             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
             if (!emailRegex.test(email)) {
                 alert('有効なメールアドレスを入力してください。');
                 formStatus.textContent = '';
                 return;
             }

            // ★ GAS URLが設定されているかチェック
             if (!gasWebAppUrl || gasWebAppUrl === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
                alert('エラー: 送信先URLが設定されていません。\nscript.jsファイルを確認してください。');
                formStatus.textContent = '送信先未設定エラー';
                formStatus.className = 'error';
                return; // 送信中止
             }


            // 送信ボタンの状態変更
            const submitBtn = form.querySelector('.submit-btn');
            let originalBtnText = 'Send Reply';
            if (submitBtn) {
                const btnTextSpan = submitBtn.querySelector('.btn-text');
                if(btnTextSpan) originalBtnText = btnTextSpan.textContent;
                submitBtn.disabled = true;
                if(btnTextSpan) btnTextSpan.textContent = 'Sending...';
            }

            // ★★★ Fetch API で GAS の Web App URL に送信 ★★★
            fetch(gasWebAppUrl, {
                method: 'POST',
                body: formData // ★ FormDataをそのまま送信
                // mode: 'no-cors' は不要
            })
            .then(response => {
                // レスポンスが正常か確認 (GASは通常JSONを返すはず)
                if (!response.ok) {
                     // ネットワークエラーや、GAS側でCORS設定が不十分な場合など
                     // 詳細なエラーは response.text() で見れるかもしれない
                    return response.text().then(text => {
                         throw new Error('Network response was not ok. Status: ' + response.status + ' Body: ' + text);
                    });
                }
                return response.json(); // GASからのJSON応答をパース
            })
            .then(data => {
                console.log('GAS Response:', data); // GASからの応答をログに表示
                if (data.result === "success") {
                    formStatus.textContent = 'ご回答ありがとうございます！送信されました。';
                    formStatus.className = 'success';
                    form.reset(); // フォームリセット
                    hiddenAttendanceInput.value = ''; // hidden inputもリセット
                    if(allergyGroup) allergyGroup.style.display = 'none'; // アレルギー欄も隠す
                } else {
                    // GAS側でエラーが起きたと報告された場合
                    formStatus.textContent = '送信エラーが発生しました: ' + (data.message || 'Unknown GAS error');
                    formStatus.className = 'error';
                    console.error('GAS Error Data:', data);
                }
            })
            .catch(error => {
                // ネットワークエラーやJSONパースエラーなど fetch 自体の失敗
                console.error('Fetch Error:', error);
                formStatus.textContent = '送信中にエラーが発生しました。ネットワーク接続などを確認してください。';
                formStatus.className = 'error';
            })
            .finally(() => {
                // 成功・失敗に関わらずボタンの状態を戻す
                 setTimeout(() => {
                     if (submitBtn) {
                        submitBtn.disabled = false;
                        const btnTextSpan = submitBtn.querySelector('.btn-text');
                         if(btnTextSpan) btnTextSpan.textContent = originalBtnText;
                     }
                 }, 1500);
            });

        }); // submit イベントリスナーの終わり
    } else {
        if (!form) console.error("Form with ID 'rsvp-form' not found.");
        if (!formStatus) console.error("Element with ID 'form-status' not found.");
    }

    // --- フッターの年表示 ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // --- 編集ノート ---
    const toggleEditNotes = function() {
        const editNotes = document.querySelectorAll('.edit-note');
        editNotes.forEach(note => {
            note.style.display = note.style.display === 'none' ? 'block' : 'none';
        });
    };
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
            toggleEditNotes();
        }
    });

}); // End DOMContentLoaded