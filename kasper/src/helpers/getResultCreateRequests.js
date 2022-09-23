const getResultCreateRequests = async (
  array,
  funcRequest,
  additionalArray = [],
) => {
  const readyArrayRequest = array.map((item, index) =>
    funcRequest(item, index, additionalArray),
  );
  return await Promise.all(readyArrayRequest);
};

export { getResultCreateRequests };
