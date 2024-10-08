/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('users', {
        id: 'id',
        username: { type: 'varchar(255)', notNull: true, unique: true },
        password: { type: 'varchar(255)', notNull: true },
        role: { type: 'varchar(20)', notNull: true },
        created_at: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('current_timestamp'),
        },
      });
    
      pgm.createTable('books', {
        id: 'id',
        title: { type: 'varchar(255)', notNull: true },
        author: { type: 'varchar(255)', notNull: true },
        isbn: { type: 'varchar(20)', notNull: true, unique: true },
        status: { type: 'varchar(20)', notNull: true },
        created_at: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('current_timestamp'),
        },
      });
    
      pgm.createTable('borrow_history', {
        id: 'id',
        user_id: {
          type: 'integer',
          notNull: true,
          references: '"users"',
          onDelete: 'cascade',
        },
        book_id: {
          type: 'integer',
          notNull: true,
          references: '"books"',
          onDelete: 'cascade',
        },
        borrow_date: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('current_timestamp'),
        },
        return_date: { type: 'timestamp' },
      });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('borrow_history');
    pgm.dropTable('books');
    pgm.dropTable('users');
};
