import { useEffect } from 'react';
import './App.css';
import { getDatabase, closeDB } from './database';

function App() {
  useEffect(() => {
    return () => {
      // clean up
      closeDB();
    };
  }, []);

  const executeQuery = async () => {
    // 初回実行時に生成、以降は生成済みのconnectionを返す
    const db = await getDatabase();

    // テーブル作成
    db.exec('CREATE TABLE IF NOT EXISTS users(id INTEGER, name TEXT)');

    const select_max = 'SELECT max(id) as max_count FROM users';
    const max = (db.selectValue(select_max) as number) ?? 0;
    console.log(`row count: ${max}`);

    // 行追加(exec)
    db.exec({
      sql: 'insert into users values(?,?)',
      bind: [max + 1, `Alice${max + 1}`],
    });

    // 行追加(prepare & bind)
    const stmt = db.prepare('insert into users values(?, ?)');
    stmt.bind([max + 2, `Bob${max + 2}`]).stepReset();
    stmt.finalize();

    // 結果出力
    const values = db.exec({
      sql: 'SELECT * FROM users',
      rowMode: 'object',
      returnValue: 'resultRows',
    });
    console.log(values);
  };

  return (
    <>
      <div>
        <button id="exec" onClick={() => executeQuery()}>
          SQLite Wasm実行
        </button>
        <p>実行結果はDevToolsのConsoleに出力されます。</p>
      </div>
    </>
  );
}

export default App;
