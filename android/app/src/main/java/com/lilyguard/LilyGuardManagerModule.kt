package com.lilyguard

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.telephony.TelephonyManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Locale

class LilyGuardManagerModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "LilyGuardManager"

  @ReactMethod
  fun getConfig(promise: Promise) {
    val preferences = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    promise.resolve(preferences.getString(CONFIG_KEY, "") ?: "")
  }

  @ReactMethod
  fun saveConfig(config: String, promise: Promise) {
    try {
      org.json.JSONObject(config)
      reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        .edit()
        .putString(CONFIG_KEY, config)
        .apply()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("INVALID_CONFIG", "The Lily Guard configuration is invalid.", error)
    }
  }

  @ReactMethod
  fun getHistory(promise: Promise) {
    try {
      LilyGuardHistoryStore(reactContext).use { store ->
        promise.resolve(store.getHistory())
      }
    } catch (error: Exception) {
      promise.reject("HISTORY_READ_FAILED", "Blocked-call history could not be loaded.", error)
    }
  }

  @ReactMethod
  fun clearHistoryForRule(ruleId: String, promise: Promise) {
    try {
      LilyGuardHistoryStore(reactContext).use { store ->
        store.clearForRule(ruleId)
      }
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("HISTORY_CLEAR_FAILED", "Rule history could not be deleted.", error)
    }
  }

  @ReactMethod
  fun clearAllHistory(promise: Promise) {
    try {
      LilyGuardHistoryStore(reactContext).use { store ->
        store.clearAll()
      }
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("HISTORY_CLEAR_FAILED", "Blocked-call history could not be deleted.", error)
    }
  }

  @ReactMethod
  fun getDeviceCountryIso(promise: Promise) {
    val telephony = reactContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    val iso = telephony.simCountryIso
      .ifBlank { telephony.networkCountryIso }
      .ifBlank { Locale.getDefault().country }
      .uppercase(Locale.ROOT)
    promise.resolve(iso)
  }

  @ReactMethod
  fun isScreeningEnabled(promise: Promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      promise.resolve(false)
      return
    }
    val roleManager = reactContext.getSystemService(RoleManager::class.java)
    promise.resolve(
      roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING) &&
        roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING),
    )
  }

  @ReactMethod
  fun requestScreeningRole(promise: Promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      promise.resolve("unsupported")
      return
    }

    try {
      val roleManager = reactContext.getSystemService(RoleManager::class.java)
      if (roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
        promise.resolve("granted")
        return
      }

      if (roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
        launchRoleRequest(
          roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING),
        )
        promise.resolve("opened")
        return
      }

      openDefaultAppsSettings()
      promise.resolve("settings")
    } catch (error: Exception) {
      try {
        openDefaultAppsSettings()
        promise.resolve("settings")
      } catch (settingsError: Exception) {
        promise.reject(
          "SCREENING_ROLE_FAILED",
          "Android could not open the Call Screening settings.",
          settingsError,
        )
      }
    }
  }

  private fun launchRoleRequest(intent: Intent) {
    val activity = reactContext.currentActivity
      ?: throw IllegalStateException("Lily Guard must be visible to request the screening role.")
    activity.startActivityForResult(intent, SCREENING_ROLE_REQUEST_CODE)
  }

  private fun launchFromForeground(intent: Intent) {
    val activity = reactContext.currentActivity
    if (activity != null) {
      activity.startActivity(intent)
    } else {
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactContext.startActivity(intent)
    }
  }

  private fun openDefaultAppsSettings() {
    val intent = Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS)
    launchFromForeground(intent)
  }

  companion object {
    const val PREFS_NAME = "lily_guard_preferences"
    const val CONFIG_KEY = "screening_config"
    private const val SCREENING_ROLE_REQUEST_CODE = 4107
  }
}
