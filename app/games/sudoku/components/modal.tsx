import React, {MouseEvent, TouchEvent, useEffect, useRef} from 'react'
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
    

    return (
        <div className={styles.select_modal}>
            <div className={styles.close_button} onClick={props.closeHandler}>×</div>
            {Array.from({ length: 9 }, (_, i) => (i + 1) as Suuji).map((n) => (
                <OptionComponent 
                    key={n}
                    n={n} 
                    handleClick={handleClick} 
                    handleLongPress={handleLongPress} 
                    handleClear={handleClear}
                    answers={props.answers}
                    isPressing={isPressing}
                />
            ))}
        </div>
    )
};

const OptionComponent = (
    props: {
        n: Suuji,
        handleClick: (n: Suuji) => void, 
        handleLongPress: (n: Suuji) => void
        handleClear: () => void,
        answers: Answers,
        isPressing: number
    }) => {
        const classNameByState = (n: Suuji): string => {
            if (props.isPressing === n) {
                return `${styles.press_animation} ${styles.select_option}`;
            } else {
                return styles.select_option;
            }
        }
        const ref = usePreventDefault<HTMLDivElement>('touchstart');
    
    return (
        <div className={classNameByState(props.n)}
            key={props.n}
            ref={ref}
            onTouchStart={(e) => {props.handleLongPress(props.n)}}
            onTouchEnd={() => props.handleClick(props.n)}
            onTouchCancel={() => props.handleClear()}
            onMouseDown={() => props.handleLongPress(props.n)}
            onMouseUp={() => props.handleClick(props.n)}
            onMouseLeave={() => props.handleClear()}
        >
            <span className={props.answers[props.n] ? styles.selected_suuji : ""}>{props.n}</span>
        </div>
    )
}
const usePreventDefault = <T extends HTMLElement>(
    eventName: string,
    enable = true
  ) => {
    const ref = useRef<T>(null);
    useEffect(() => {
      const current = ref.current;
      if (!current) {
        return;
      }
      const handler = (event: Event) => {
        if (enable) {
          event.preventDefault();
        }
      };
      current.addEventListener(eventName, handler);
      return () => {
        current.removeEventListener(eventName, handler);
      };
    }, [enable, eventName]);
  
    return ref;
  };
  