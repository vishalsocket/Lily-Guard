package com.lilyguard

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import org.json.JSONArray
import org.json.JSONObject

class LilyGuardHistoryStore(context: Context) :
  SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

  override fun onCreate(database: SQLiteDatabase) {
    database.execSQL(
      """
      CREATE TABLE $TABLE_HISTORY (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_id TEXT NOT NULL,
        number TEXT NOT NULL,
        blocked_at INTEGER NOT NULL
      )
      """.trimIndent(),
    )
    database.execSQL(
      "CREATE INDEX history_rule_time ON $TABLE_HISTORY(rule_id, blocked_at DESC)",
    )
  }

  override fun onUpgrade(
    database: SQLiteDatabase,
    oldVersion: Int,
    newVersion: Int,
  ) = Unit

  fun record(ruleId: String, number: String) {
    writableDatabase.execSQL(
      "INSERT INTO $TABLE_HISTORY(rule_id, number, blocked_at) VALUES (?, ?, ?)",
      arrayOf<Any>(ruleId, number, System.currentTimeMillis()),
    )
  }

  fun getHistory(): String {
    val history = JSONArray()
    readableDatabase.query(
      TABLE_HISTORY,
      arrayOf("id", "rule_id", "number", "blocked_at"),
      null,
      null,
      null,
      null,
      "blocked_at DESC, id DESC",
    ).use { cursor ->
      val idColumn = cursor.getColumnIndexOrThrow("id")
      val ruleColumn = cursor.getColumnIndexOrThrow("rule_id")
      val numberColumn = cursor.getColumnIndexOrThrow("number")
      val timeColumn = cursor.getColumnIndexOrThrow("blocked_at")
      while (cursor.moveToNext()) {
        history.put(
          JSONObject()
            .put("id", cursor.getLong(idColumn).toString())
            .put("ruleId", cursor.getString(ruleColumn))
            .put("number", cursor.getString(numberColumn))
            .put("timestamp", cursor.getLong(timeColumn)),
        )
      }
    }
    return history.toString()
  }

  fun clearForRule(ruleId: String) {
    writableDatabase.delete(TABLE_HISTORY, "rule_id = ?", arrayOf(ruleId))
  }

  fun clearAll() {
    writableDatabase.delete(TABLE_HISTORY, null, null)
  }

  companion object {
    private const val DATABASE_NAME = "lily_guard_history.db"
    private const val DATABASE_VERSION = 1
    private const val TABLE_HISTORY = "blocked_call_history"
  }
}
