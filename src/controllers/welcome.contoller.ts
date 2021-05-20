import { start_buttons } from "../shared/buttons";
import { start_msg } from "../shared/strings";
import { check_account, connect, create_account, db } from "../database";
import { GbanI, PrefsI } from "../interfaces/database";
import { owner } from "../config";

export async function get_account(ctx: any, chat: number): Promise<any> {
  try {
    if ((await check_account(chat.toString())) == true) {
      return ctx.reply(start_msg, start_buttons);
    } else {
      let res = await ctx.getChat();
      let new_account = {
        id: res.id.toString(),
        title: res.title,
        account: res.username || undefined,
        type: res.type,
      };
      await create_account(new_account);
      return ctx.reply("Cuenta creada satisfactoriamente");
    }
  } catch (error) {}
}
export async function get_prefs(account) {
  await connect(account);
  const prefs = await db(account).get("prefs").value();
  return prefs;
}
export async function set_goodbye(account, content) {
  const found: PrefsI = await get_prefs(account);
  if (found !== undefined) {
    let new_prefs = {
      source: content.source,
      type: content.type,
    };
    await connect(account);
    await db(account).get("prefs").get("goodbye").assign(new_prefs).write();
    return "Despedida establecida";
  } else {
    return "Error al establecer la Despedida";
  }
}
export async function set_welcome(account, content) {
  const found: PrefsI = await get_prefs(account);
  if (found !== undefined) {
    let new_prefs = {
      source: content.source,
      type: content.type,
    };
    await connect(account);
    await db(account).get("prefs").get("welcome").assign(new_prefs).write();
    return "Bienvenida establecida";
  } else {
    return "Error al establecer la bienvenida";
  }
}
export async function set_status(status, account, pref: "welcome" | "goodbye") {
  await connect(account);
  try {
    let current = await db(account).get(`prefs.${pref}.status`).value();
    if (current == status) {
      return `El estado ya es: ${status}`;
    } else {
      let a = await db(account)
        .get(`prefs.${pref}`)
        .assign({ status: status })
        .write();
      return `${pref} status: ${a.status}`;
    }
  } catch (error) {
    return "Error";
  }
}
export async function detect_user(ctx, text: string): Promise<string> {
  let member = ctx.update.message.new_chat_member;
  if (member.id === owner.id) {
    return "Bienvenido propietario";
  } else {
    text = text.replace("{first_name}", member.first_name);
    text = text.replace("{last_name}", member.last_name || undefined);
    text = text.replace("{username}", `@${member.first_name}`);
    text = text.replace("{id}", member.id);
    return text;
  }
}
