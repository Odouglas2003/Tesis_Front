import styles from './LoadingAnimation.module.css';

const LoadingAnimation = () => {
    return (
        <div className={styles.loading}>
            <div className={styles.loading__square}></div>
            <div className={styles.loading__square}></div>
            <div className={styles.loading__square}></div>
            <div className={styles.loading__square}></div>
            <div className={styles.loading__square}></div>
            <div className={styles.loading__square}></div>
            <div className={styles.loading__square}></div>
        </div>
    );
};

export default LoadingAnimation;
