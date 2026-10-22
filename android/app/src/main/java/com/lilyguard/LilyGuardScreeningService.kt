package com.lilyguard

import android.telecom.Call
import android.telecom.CallScreeningService
import android.os.Build
import org.json.JSONObject

class LilyGuardScreeningService : CallScreeningService() {
  override fun onScreenCall(callDetails: Call.Details) {
    val isIncoming = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q ||
      callDetails.callDirection == Call.Details.DIRECTION_INCOMING
    if (!isIncoming) return

    val number = callDetails.handle?.schemeSpecificPart.orEmpty()
    val matchedRuleId = findMatchingRule(number)
    val shouldBlock = matchedRuleId != null
    val response = CallResponse.Builder()
      .setDisallowCall(shouldBlock)
      .setRejectCall(shouldBlock)
      .setSilenceCall(false)
      .setSkipCallLog(false)
      .setSkipNotification(shouldBlock)
      .build()
    respondToCall(callDetails, response)
    if (matchedRuleId != null) {
      LilyGuardHistoryStore(applicationContext).use { store ->
        store.record(matchedRuleId, number)
      }
    }
  }

  private fun findMatchingRule(rawNumber: String): String? {
    if (rawNumber.isBlank()) return null
    val stored = getSharedPreferences(LilyGuardManagerModule.PREFS_NAME, MODE_PRIVATE)
      .getString(LilyGuardManagerModule.CONFIG_KEY, null)
      ?: return null

    return try {
      val config = JSONObject(stored)
      if (!config.optBoolean("protectionEnabled", true)) return null

      val trimmedNumber = rawNumber.trim()
      val hasInternationalPrefix = trimmedNumber.startsWith("+") || trimmedNumber.startsWith("00")
      val rawDigits = trimmedNumber.filter(Char::isDigit)
      val digits = if (trimmedNumber.startsWith("00")) rawDigits.removePrefix("00") else rawDigits
      if (digits.isBlank() || digits in ALWAYS_ALLOW) return null

      val protectedCode = config.optString("protectedCountryCode").filter(Char::isDigit)
      val national = if (
        protectedCode.isNotBlank() &&
        digits.startsWith(protectedCode) &&
        digits.length > protectedCode.length + 5
      ) {
        digits.removePrefix(protectedCode)
      } else {
        digits
      }

      val rules = config.optJSONArray("rules") ?: return null
      for (index in 0 until rules.length()) {
        val rule = rules.optJSONObject(index) ?: continue
        if (!rule.optBoolean("enabled", true)) continue
        val value = rule.optString("value").filter(Char::isDigit)
        if (value.isBlank()) continue

        val matches = when (rule.optString("type")) {
          "exact" -> digits == value || national == value
          "starts_with" -> digits.startsWith(value) || national.startsWith(value)
          "ends_with" -> digits.endsWith(value) || national.endsWith(value)
          "contains" -> value.length >= 4 && (digits.contains(value) || national.contains(value))
          // Avoid treating a local 140... number as country code +1.
          "country" -> hasInternationalPrefix && value != protectedCode && digits.startsWith(value)
          else -> false
        }
        if (matches) return rule.optString("id").ifBlank { null }
      }
      null
    } catch (_: Exception) {
      null
    }
  }

  companion object {
    private val ALWAYS_ALLOW = setOf("100", "101", "102", "108", "112", "911")
  }
}
