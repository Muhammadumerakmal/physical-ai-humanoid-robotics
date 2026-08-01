import type {ReactNode} from 'react';
import BookAgent from '@site/src/components/BookAgent';
import ReadingProgress from '@site/src/components/ReadingProgress';

/**
 * Docusaurus <Root> wraps the whole app on every route (imported by
 * @docusaurus/core as `@theme/Root`). We use it to mount the floating
 * book assistant and the reading-progress bar globally, independent of
 * the current page.
 */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <BookAgent />
      <ReadingProgress />
    </>
  );
}
