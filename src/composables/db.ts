import { Database } from "@/db";

let db: Database;

export const useDB = (): {
  db: Database;
} => {
  if (!db) {
    db = new Database();
  }

  return {
    db,
  };
  // return {
  //   db: new Database(),
  // };
};
