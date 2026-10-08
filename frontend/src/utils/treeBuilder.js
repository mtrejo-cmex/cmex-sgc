export const buildFileTree = (documentos, basePath) => {
  const tree = { name: 'root', folders: {}, files: [] };

  documentos.forEach((doc) => {
    // Extraemos la ruta después de la categoría padre
    // Ejemplo: /home/.../03_OPERATIVO/Administracion de Inventarios/archivo.pdf
    const parts =
      doc.url_almacenamiento.split(`${basePath}/`)[1]?.split('/') || [];

    let current = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      if (!current.folders[folderName]) {
        current.folders[folderName] = {
          name: folderName,
          folders: {},
          files: [],
        };
      }
      current = current.folders[folderName];
    }
    current.files.push(doc);
  });
  return tree;
};
