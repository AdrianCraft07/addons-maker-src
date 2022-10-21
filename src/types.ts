type use_on = undefined;
type on_complete = undefined;
type category = undefined;
type destroy_speeds = undefined;
type on_dig = undefined;
type dispense_on = undefined;
type on_consume = undefined;
type using_converts_to = undefined;
type on_use = undefined;
type on_use_on = undefined;
type projectile_entity = undefined;
type sound_event = 'undefined';
type main_hand = undefined;
type off_hand = undefined;
type on_repaired = undefined;
type repair_items = undefined;
type ammunition = undefined;
type max_draw_duration = undefined;
type on_hit_block = undefined;
type on_hurt_entity = undefined;
type on_not_hurt_entity = undefined;
type GeometryString = 'geometry.my_model';
type condition = undefined;
type face =
  | 'up'
  | 'down'
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'side'
  | 'all';
type on_tick = { condition: condition; event: String; target: String };
type vector = [Number, Number, Number];
type Molang = undefined;

export interface ComponentsItem {
  'minecraft:max_stack'?: Number;
  'minecraft:armor'?: {
    protection: Number;
    texture_type:
      | 'leather'
      | 'none'
      | 'chain'
      | 'iron'
      | 'diamond'
      | 'gold'
      | 'elytra'
      | 'turtle'
      | 'netherite';
  };
  'minecraft:block_placer'?: {
    block: String;
    use_on: use_on[] | use_on;
  };
  'minecraft:chargeable'?: {
    movement_modifier: Number;
    on_complete: on_complete;
  };
  'minecraft:cooldown'?: {
    category: category;
    duration: Number;
  };
  'minecraft:digger'?: {
    destroy_speeds: destroy_speeds | destroy_speeds[];
    on_dig: on_dig;
    use_efficiency: Boolean;
  };
  'minecraft:display_name'?: {
    value: String;
  };
  'minecraft:durability'?: {
    damage_chance: Number;
    max_durability: Number;
  };
  'minecraft:dye_powder'?: {
    color:
      | 'black'
      | 'red'
      | 'green'
      | 'brown'
      | 'blue'
      | 'purple'
      | 'cyan'
      | 'silver'
      | 'gray'
      | 'pink'
      | 'lime'
      | 'yellow'
      | 'lightblue'
      | 'magenta'
      | 'orange'
      | 'white';
  };
  'minecraft:entity_placer'?: {
    dispense_on: dispense_on | dispense_on[];
    entity: String;
    use_on: use_on | use_on[];
  };
  'minecraft:food'?: {
    can_alway_eat: Boolean;
    nutrition: Number;
    on_consume: on_consume;
    saturation_modifier: Number;
    using_converts_to: using_converts_to;
  };
  'minecraft:fuel'?: {
    duration: Number;
  };
  'minecraft:icon'?: {
    legacy_id?: String;
    texture: String;
  };
  'minecraft:item_storage'?: {
    capacity: Number;
  };
  'minecraft:knockback_resistance'?: {
    protection: Number;
  };
  'minecraft:on_use'?: {
    on_use: on_use;
  };
  'minecraft:on_use_on'?: {
    on_use_on: on_use_on;
  };
  'minecraft:projectile'?: {
    minimum_critical_power: Number;
    projectile_entity: projectile_entity;
  };
  'minecraft:record'?: {
    comparator_signal: Number;
    duration: Number;
    sound_event?: sound_event;
  };
  'minecraft:render_offsets'?: {
    main_hand?: main_hand;
    off_hand?: off_hand;
  };
  'minecraft:repairable'?: {
    on_repaired: on_repaired;
    repair_items: repair_items | repair_items[];
  };
  'minecraft:shooter'?: {
    ammunition: ammunition | ammunition[];
    change_on_draw: Boolean;
    launch_power_scale: Number;
    max_draw_duration: max_draw_duration;
    max_launch_power: Number;
    scale_power_by_draw_duration: Boolean;
  };
  'minecraft:throwable'?: {
    do_swing_animation: Boolean;
    launch_power_scale: Number;
    max_draw_duration: Number;
    max_launch_power: Number;
    min_draw_duration: Number;
    scale_power_by_draw_duration: Boolean;
  };
  'minecraft:weapon'?: {
    on_hit_block: on_hit_block;
    on_hurt_entity: on_hurt_entity;
    on_not_hurt_entity: on_not_hurt_entity;
  };
  'minecraft:wearable'?: {
    slot:
      | 'slot.weapon.mainhand'
      | 'none'
      | 'slot.weapon.offhand'
      | 'slot.armor.head'
      | 'slot.armor.chest'
      | 'slot.armor.legs'
      | 'slot.armor.feet'
      | 'slot.hotbar'
      | 'slot.inventory'
      | 'slot.enderchest'
      | 'slot.saddle'
      | 'slot.armor'
      | 'slot.chest'
      | 'slot.equippable';
  };
}
export interface Events {
  run_command?: {
    command: String[];
  };
  sequence?: Events[];
  randomize?: {
    weight: 0;
  }[];
  add_mob_effect?: {
    effect: String;
    amplifier: Number;
    duration: Number;
  };
  damage?: {
    amount: Number;
    type: 'magic';
  };
  decrement_stack?: {};
  remove_mob_effect?: {
    effect: String;
  };
  shoot?: {
    angle_offset: Number;
    launch_power: Number;
    projectile: String;
  };
  swing?: {};
  teleport?: {
    max_range: Number[];
  };
  transform_item?: {
    transform: String;
  };
}
export interface ComponentsBlock {
  'minecraft:block_light_filter'?: Number;
  'minecraft:collision_box'?: Boolean | { origin: vector; size: vector };
  'minecraft:crafting_table'?: {
    crafting_tags: ['crafting_table'] | String[];
    table_name: String;
  };
  'minecraft:creative_category'?: {
    category: 'construction' | 'nature' | 'equipment' | 'items';
    group: String;
  };
  'minecraft:destructible_by_explotion'?:
    | Boolean
    | { explosion_resistance: Number };
  'minecraft:destructible_by_mining'?: Boolean | { seconds_to_destroy: Number };
  'minecraft:display_name'?: String;
  'minecraft:flammable'?:
    | Boolean
    | { catch_chance_modifier: Number; destroy_chance_modifier: Number };
  'minecraft:friction'?: Number;
  'minecraft:geometry'?: GeometryString;
  'minecraft:light_emission'?: Number;
  'minecraft:loot'?: String;
  'minecraft:map_color'?: '#ffffff';
  'minecraft:material_instances'?: {
    ambient_occlusion: Boolean;
    face_dimming: Boolean;
    render_method: 'opaque' | 'double_sided' | 'blend' | 'alpha_test';
    texture: String;
  };
  'minecraft:part_visibility'?: { conditions: condition };
  'minecraft:placement_filter'?: {
    allowed_faces: face[];
    block_filter: String[];
  };
  'minecraft:queued_ticking'?: {
    interval_range: Number[];
    looping: Boolean;
    on_tick: on_tick;
  };
  'minecraft:random_ticking'?: { on_tick: on_tick };
  'minecraft:rotation'?: vector;
  'minecraft:selection_box'?: Boolean | { origin: vector; size: vector };
  'minecraft:unit_cube'?: {};
}
export interface EventsBlock extends Events {
  die?: { target: String };
  play_effect?: { data: Number; effect: String; target: String };
  play_sound?: { sound: String; target: String };
  set_block?: { block_type: String };
  set_block_at_pos?: { block_type: String; block_offset: vector };
  set_block_property?: { property: Molang };
  spawn_loot?: { table: string };
  sequence?: EventsBlock[];
}
export interface ComponentsEntity {
  'minecraft:movement.basic'?: {};
  'minecraft:physics'?: {};
  'minecraft:boss'?: {
    should_darken_sky: Boolean;
    hud_range: 125;
    name: String;
  };
  'minecraft:movement'?: {
    value: Number;
  };
  'minecraft:health'?: {
    value: Number;
    max: Number;
  };
  'minecraft:loot'?: {
    table: String;
  };
  'minecraft:collision_box'?: {
    width: Number;
    height: Number;
  };
  'minecraft:type_family'?: {
    family: String[];
  };
  'minecraft:experience_reward'?: {
    on_death: String | Number;
  };
}
export interface EventsEntity {
  add?: {
    component_groups: String[];
  };
  randomize?: EventsEntity[];
  remove?: {
    component_groups: String[];
  };
  sequence?: EventsEntity[];
}

export type lootCondition = {
  chance: Number;
  default_chance: Number;
  easy: Number;
  entity: String;
  hard: Number;
  looting_multiplier: Number;
  max_chance: Number;
  normal: Number;
  peaceful: Number;
  properties: {
    on_fire: Boolean;
    on_ground: Boolean;
  };
  value: String;
};
export type pool = {
  rolls?: Number;
  entries?: [
    {
      type: 'item' | 'empty' | 'loot_table';
      name: String;
      weight: Number;
      quality: Number;
      functions: {
        function: 'set_count';
        count: {
          min: Number;
          max: Number;
        };
        add: Boolean;
      }[];
      count: Number;
      pools: pool[];
    }
  ];
  bonus_rolls?: Number;
  conditions?: lootCondition[];
  tiers?: {
    bonus_chance: Number;
    bonus_rolls: Number;
    initial_range: Number;
  };
  type?: 'item' | 'empty' | 'loot_table';
};
export interface LootD {
  type?: 'minecraft:chest';
  pools: pool[];
}
export interface json {
  item: {
    format_version: String;
    'minecraft:item': {
      description: { identifier: String };
      components: ComponentsItem;
      events: { [text: string]: Events };
    };
  };
  block: {
    format_version: String;
    'minecraft:block': {
      description: { identifier: String };
      components: ComponentsBlock;
      events: { [text: string]: Events };
    };
  };
  entity: {
    format_version: String;
    'minecraft:entity': {
      description: {
        identifier: String;
        is_spawnable: Boolean;
        is_summonable: Boolean;
        is_experimental: Boolean;
      };
      components: ComponentsEntity;
      events: { [text: string]: EventsEntity };
    };
  };
  loot_tables: LootD;
}

//#endregion

export const json = {
  item: {
    format_version: '1.19.0',
    'minecraft:item': {
      description: { identifier: '' },
      components: {},
      events: {},
    },
  },
  block: {
    format_version: '1.19.0',
    'minecraft:block': {
      description: { identifier: '' },
      components: {},
      events: {},
    },
  },
  entity: {
    format_version: '1.19.0',
    'minecraft:entity': {
      description: {
        identifier: '',
        is_spawnable: true,
        is_summonable: true,
        is_experimental: false,
      },
      component_groups: {},
      components: {},
      events: {},
    },
  },
  loot_tables: { pools: [] },
};