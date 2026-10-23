package com.hzblj.expoflagskit

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import com.facebook.react.uimanager.BackgroundStyleApplicator
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.types.Enumerable
import expo.modules.kotlin.views.ExpoView
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

enum class FlagContentFit(val value: String) : Enumerable {
  CONTAIN("contain"),
  COVER("cover"),
  FILL("fill")
}

// Draws the flag's VectorDrawable straight into the view: no child view to lay out, and the drawable
// renders at its bounds, so it stays sharp at any size.
@SuppressLint("ViewConstructor")
class FlagView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private var flag: Drawable? = null

  var code: String? = null
    set(value) {
      if (field != value) {
        field = value
        // mutate() gives every view its own render cache, so the same flag shown at two sizes doesn't
        // re-rasterize on every frame.
        flag = value?.let(FlagDrawables::resourceId)?.let { context.getDrawable(it)?.mutate() }
        updateFlagBounds()
        invalidate()
      }
    }

  var contentFit = FlagContentFit.COVER
    set(value) {
      if (field != value) {
        field = value
        updateFlagBounds()
        invalidate()
      }
    }

  override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
    super.onSizeChanged(width, height, oldWidth, oldHeight)
    updateFlagBounds()
  }

  private fun updateFlagBounds() {
    val flag = flag ?: return

    if (contentFit == FlagContentFit.FILL) {
      flag.setBounds(0, 0, width, height)
      return
    }

    val intrinsicWidth = flag.intrinsicWidth.toFloat()
    val intrinsicHeight = flag.intrinsicHeight.toFloat()
    val widthScale = width / intrinsicWidth
    val heightScale = height / intrinsicHeight
    val scale = if (contentFit == FlagContentFit.COVER) max(widthScale, heightScale) else min(widthScale, heightScale)
    val flagWidth = (intrinsicWidth * scale).roundToInt()
    val flagHeight = (intrinsicHeight * scale).roundToInt()
    val left = (width - flagWidth) / 2
    val top = (height - flagHeight) / 2

    flag.setBounds(left, top, left + flagWidth, top + flagHeight)
  }

  override fun dispatchDraw(canvas: Canvas) {
    flag?.let { flag ->
      val saveCount = canvas.save()
      // Clips to the padding box, so the flag follows borderRadius and stays inside borders; covered flags
      // are larger than the view.
      BackgroundStyleApplicator.clipToPaddingBoxWithAntiAliasing(this, canvas) { flag.draw(canvas) }
      canvas.restoreToCount(saveCount)
    }

    super.dispatchDraw(canvas)
  }
}
