import type {ReactNode} from 'react';
import ReadingProgress from '@site/src/components/ReadingProgress';

/**
 * Docusaurus <Root> wraps the whole app on every route. Here it mounts the
 * reading-progress bar globally.
 */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <ReadingProgress />
    </>
  );
}
