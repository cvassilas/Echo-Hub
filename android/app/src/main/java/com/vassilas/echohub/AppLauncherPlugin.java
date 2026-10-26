package com.vassilas.echohub;

import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.util.List;

/** Lists installed apps that have a launcher icon, and opens one by package name. */
@CapacitorPlugin(name = "AppLauncher")
public class AppLauncherPlugin extends Plugin {

    @PluginMethod
    public void listApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        Intent main = new Intent(Intent.ACTION_MAIN);
        main.addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> apps = pm.queryIntentActivities(main, 0);
        JSArray out = new JSArray();
        String self = getContext().getPackageName();
        for (ResolveInfo ri : apps) {
            String pkg = ri.activityInfo.packageName;
            if (pkg.equals(self)) continue;
            JSObject o = new JSObject();
            o.put("packageName", pkg);
            o.put("label", String.valueOf(ri.loadLabel(pm)));
            o.put("system", (ri.activityInfo.applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
            out.put(o);
        }
        JSObject ret = new JSObject();
        ret.put("apps", out);
        call.resolve(ret);
    }

    @PluginMethod
    public void getIcon(PluginCall call) {
        String pkg = call.getString("packageName");
        try {
            Drawable d = getContext().getPackageManager().getApplicationIcon(pkg);
            int size = 96;
            Bitmap bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
            Canvas c = new Canvas(bmp);
            d.setBounds(0, 0, size, size);
            d.draw(c);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            bmp.compress(Bitmap.CompressFormat.PNG, 100, bos);
            JSObject ret = new JSObject();
            ret.put("dataUrl", "data:image/png;base64," + Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP));
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Not installed");
        }
    }

    @PluginMethod
    public void open(PluginCall call) {
        String pkg = call.getString("packageName");
        Intent i = pkg == null ? null : getContext().getPackageManager().getLaunchIntentForPackage(pkg);
        if (i == null) { call.reject("That app isn't installed"); return; }
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    @PluginMethod
    public void openUrl(PluginCall call) {
        String url = call.getString("url");
        if (url == null) { call.reject("No link"); return; }
        Intent i = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        if (i.resolveActivity(getContext().getPackageManager()) == null) { call.reject("Clinical Logs isn't installed on this phone"); return; }
        getContext().startActivity(i);
        call.resolve();
    }
}
