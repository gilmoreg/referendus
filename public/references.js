
/* eslint-disable no-underscore-dangle */
/* global $, Referendus */
const References = (() => { // eslint-disable-line no-unused-vars
  let collection = [];

  const dbCreate = ref =>
    $.ajax({
      url: 'refs/',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(ref),
    });

  const dbGet = (id) => {
    let url = '';
    if (id) url = `ref/${id}`;
    else url = `refs/${Referendus.getFormat()}`;
    return $.ajax({
      url,
      type: 'GET',
      contentType: 'application/json',
    });
  };

  const dbUpdate = (id, ref) =>
    $.ajax({
      url: `refs/${id}`,
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(ref),
    });

  const dbDelete = id =>
    $.ajax({
      url: `refs/${id}`,
      type: 'DELETE',
    });

  const getAllByType = type =>
    collection.filter(item => item.data.type === type);

  const getAllByTag = tag =>
    collection.filter((item) => {
      const index = item.data.tags.findIndex(r => r.tag === tag);
      return index !== -1;
    });

  return {
    create: (ref) => {
      collection.push(ref);
      return new Promise((resolve, reject) => {
        if (!Referendus.getUser()) reject('Must be logged in.');
        dbCreate(ref)
          .done(() => resolve())
          .fail(msg => reject(msg));
      });
    },
    getAll: () =>
      new Promise((resolve, reject) => {
        if (!Referendus.getUser()) reject('Must be logged in.');
        dbGet()
          .done((data) => {
            collection = data.refs;
            resolve(data);
          })
          .fail(() => reject());
      }),
    // Clipboard will not allow copying after an AJAX call, so just get what we have
    getAllLocal: () => collection,
    getAllVisible: () => {
      switch (Referendus.getActiveTab()) {
        case 'All': return collection;
        case 'Articles': return getAllByType('Article');
        case 'Books': return getAllByType('Book');
        case 'Websites': return getAllByType('Website');
        // Assuming search results active if it doesn't match the above
        default: return getAllByTag(Referendus.getActiveTab());
      }
    },
    getByID: id =>
      new Promise((resolve, reject) => {
        if (!Referendus.getUser()) reject('Must be logged in.');
        // If it in local memory, return that
        const index = collection.findIndex(r => r.data._id === id);
        if (index !== -1) {
          resolve(collection[index]);
        }
        dbGet(id)
          .done(data => resolve(data))
          .fail(() => reject());
      }),
    search: tag =>
      new Promise((resolve, reject) => {
        if (!Referendus.getUser()) reject('Must be logged in.');
        const results = getAllByTag(tag);
        if (results.length > 0) resolve(results);
        else reject();
      }),
    update: (id, ref) =>
      new Promise((resolve, reject) => {
        if (!Referendus.getUser()) reject('Must be logged in.');
        dbUpdate(id, ref)
          .done((data) => {
            const index = collection.findIndex(r => r.data._id === id);
            collection[index] = ref;
            resolve(data);
          })
          .fail(() => reject());
      }),
    delete: id =>
      new Promise((resolve, reject) => {
        if (!Referendus.getUser()) reject('Must be logged in.');
        dbDelete(id)
          .done(() => {
            collection = collection.filter(ref => ref.data._id !== id);
            resolve();
          })
          .fail(() => reject());
      }),
  };
})();
