export const formatCommentDate = (createdAt: string): string => {
  const createdDate = new Date(createdAt);
  const now = new Date();

  const isToday = createdDate.toDateString() === now.toDateString();

  return isToday
    ? createdDate.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : `${createdDate.getFullYear()}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${String(createdDate.getDate()).padStart(2, "0")}`;
};
