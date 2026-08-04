import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

/**
 * The interactive humanoid capstone. The three.js / react-three-fiber scene
 * lives in ./Lab and is loaded only in the browser via BrowserOnly + require,
 * so it never evaluates during server-side rendering.
 */
export default function RobotLab() {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.loading}>Loading the Robot Lab…</div>
      }>
      {() => {
        const Lab = require('./Lab').default;
        return <Lab />;
      }}
    </BrowserOnly>
  );
}
