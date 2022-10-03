export const HighlightingVariables = ({ text }) => {
  if (text === undefined) {
    return null;
  }
  return text.split(' ').map((word, i) => {
    if (word.includes('{')) {
      return (
        <>
          <span
            style={{
              color: '#F4266E',
              fontWeight: '600',
            }}
            key={i}
          >
            {word}
          </span>
          <span> </span>
        </>
      );
    }
    return <span key={i}>{word + ' '}</span>;
  });
};
