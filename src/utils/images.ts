export const getHobbyImages = async (slug: string) => {
  const hobbyImages = import.meta.glob(
    [
      "../content/hobbies/**/*.{jpg,jpeg,png}",
      "!../content/hobbies/**/cover.{jpg,jpeg,png}",
    ],
    {
      eager: true,
      import: "default",
    }
  );

  const images = Object.entries(hobbyImages).filter(([key]) =>
    key.includes(slug)
  );

  const metadatas = images.map((imageTuple: [string, ImageMetadata]) => {
    const [rawPath, imageMetadata] = imageTuple;
    return imageMetadata;
  });
  return metadatas;
};
