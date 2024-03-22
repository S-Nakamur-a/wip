import React from 'react'
import { Answers, Suuji } from '../libs/sudoku'
import styles from './modal.module.css'


// (x, y) を中心に半透明の円形モーダルを表示し、1-9の数字を選択できるようにする
type ModalProps = {
    // x: number,
    // y: number,
    answers: Answers,
    closeHandler: () => void,
    assumeHandler: (n: Suuji) => void,
    answerHandler: (n: Suuji) => void,
    // setHandler: (x: number, y: number, n: SuujiWithBlank) => void,
}


// モーダルの責務は以下になる
// - 0-9の数字を選択できるようにする
// - 呼び出し側に選択された数字を返す
// - 上記の操作以外の場所をクリックしたらモーダルを閉じる
// - モーダルを開く位置を指定できるようにする
export const ModalComponent = (props: ModalProps) => {
    const pressTimer = React.useRef<NodeJS.Timeout>();
    const [isPressing, setIsPressing] = React.useState(0);
    const handleLongPress = (n: Suuji) => {
        // 500msで長押しに入る
        pressTimer.current = setTimeout(() => {
            setIsPressing(n);
            pressTimer.current = setTimeout(() => {
                props.assumeHandler(n);
                pressTimer.current = setTimeout(() => {
                    handleClear();
                    props.closeHandler();
                }, 1000);
            }, 500);
        }, 500);
    };

    const handleClick = (n: Suuji) => {
        if (pressTimer.current) {
            if (isPressing === 0) {
                props.answerHandler(n);
                handleClear();    
                props.closeHandler();
            } else {
                handleClear();
                console.log("cancel ");
            }
        }
    }
    const handleClear = () => {
        clearTimeout(pressTimer.current);
        pressTimer.current = undefined;
        setIsPressing(0);
    }
    
    const classNameByState = (n: Suuji): string => {
        if (isPressing === n) {
            return `${styles.press_animation} ${styles.select_option}`;
        } else {
            return styles.select_option;
        }
    }
    return (
        <div className={styles.select_modal}>
            <div className={styles.close_button} onClick={props.closeHandler}>×</div>
            {Array.from({ length: 9 }, (_, i) => (i + 1) as Suuji).map((n) => (
                <div className={classNameByState(n)}
                    key={n}
                    onMouseDown={() => handleLongPress(n)}
                    onMouseUp={() => handleClick(n)}
                    onMouseLeave={() => pressTimer.current && handleClear()}
                >
                    <span className={props.answers[n] ? styles.selected_suuji : ""}>{n}</span>
                </div>
            ))}
        </div>
    )
};
