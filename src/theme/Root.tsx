import type {ReactNode} from 'react';
import BookAgent from '@site/src/components/BookAgent';
import ReadingProgress from '@site/src/components/ReadingProgress';
import Notes from '@site/src/components/Notes';

/**
 * Docusaurus <Root> wraps the whole app on every route (imported by
 * @docusaurus/core as `@theme/Root`). We use it to mount the floating
 * book assistant, the reading-progress bar, and the notes/highlights
 * tool globally, independent of the current page.
 */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <BookAgent />
      <ReadingProgress />
      <Notes />
    </>
  );
}
