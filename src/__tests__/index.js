/* eslint no-underscore-dangle: 0 global-require: 0 */
import {
  checkoutDevelop,
  finishRelease,
  createReleaseBranch,
  createFeatureBranch,
  finishFeature,
  finishBranch,
} from 'src/index';

jest.mock('run-command-promise');

describe('Git', () => {
  test('finishBranch error', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);

    expect(() => {
      finishBranch('new_feature', 'woops', true);
    }).toThrow();
  });

  test('finishBranch feature', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);

    return finishBranch('new_feature', 'feature', true)
      .then(() => expect(callback.mock.calls.length).toBe(3))
      .then(() =>
        expect(callback.mock.calls[0][0]).toBe('git checkout develop'),
      )
      .then(() =>
        expect(callback.mock.calls[1][0]).toBe(
          'git merge --no-ff feature/new_feature',
        ),
      )
      .then(() =>
        expect(callback.mock.calls[2][0]).toBe(
          'git branch -d feature/new_feature',
        ),
      );
  });

  test('finishBranch release', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);

    return finishBranch('0.1.0', 'release', true)
      .then(() => expect(callback.mock.calls.length).toBe(6))
      .then(() => expect(callback.mock.calls[0][0]).toBe('git checkout master'))
      .then(() =>
        expect(callback.mock.calls[1][0]).toBe(
          'git merge --no-ff release/0.1.0',
        ),
      )
      .then(() =>
        expect(callback.mock.calls[2][0]).toBe("git tag -a -m '' v0.1.0"),
      )
      .then(() =>
        expect(callback.mock.calls[3][0]).toBe('git checkout develop'),
      )
      .then(() =>
        expect(callback.mock.calls[4][0]).toBe(
          'git merge --no-ff release/0.1.0',
        ),
      )
      .then(() =>
        expect(callback.mock.calls[5][0]).toBe('git branch -d release/0.1.0'),
      );
  });

  test('finishFeature with delete', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);
    finishFeature('0.2.0', true).then(() => {
      expect(callback.mock.calls.length).toBe(3);
      expect(callback.mock.calls[0][0]).toBe('git checkout develop');
      expect(callback.mock.calls[1][0]).toBe('git merge --no-ff feature/0.2.0');
      expect(callback.mock.calls[2][0]).toBe('git branch -d feature/0.2.0');
    });
  });

  test('finishFeature no delete', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);
    finishFeature('0.2.0', false).then(() => {
      expect(callback.mock.calls.length).toBe(2);
      expect(callback.mock.calls[0][0]).toBe('git checkout develop');
      expect(callback.mock.calls[1][0]).toBe('git merge --no-ff feature/0.2.0');
    });
  });

  test('checkoutDevelop', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);
    checkoutDevelop().then(() => {
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBe('git checkout develop');
    });
  });

  test('createFeatureBranch', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);
    createReleaseBranch('1.0.0').then(() => {
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBe(
        'git checkout -b release/1.0.0 develop',
      );
    });
  });

  test('createReleaseBranch', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);
    createFeatureBranch('new_feature').then(() => {
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBe(
        'git checkout -b feature/new_feature develop',
      );
    });
  });

  test('finishRelease delete', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);

    return finishRelease('0.1.0', true).then(() => {
      expect(callback.mock.calls.length).toBe(6);
      expect(callback.mock.calls[0][0]).toBe('git checkout master');
      expect(callback.mock.calls[1][0]).toBe('git merge --no-ff release/0.1.0');
      expect(callback.mock.calls[2][0]).toBe("git tag -a -m '' v0.1.0");
      expect(callback.mock.calls[3][0]).toBe('git checkout develop');
      expect(callback.mock.calls[4][0]).toBe('git merge --no-ff release/0.1.0');
      expect(callback.mock.calls[5][0]).toBe('git branch -d release/0.1.0');
    });
  });

  test('finishRelease no delete', () => {
    const callback = jest.fn();
    require('run-command-promise').__setResponse(callback);

    return finishRelease('0.1.0', false).then(() => {
      expect(callback.mock.calls.length).toBe(5);
      expect(callback.mock.calls[0][0]).toBe('git checkout master');
      expect(callback.mock.calls[1][0]).toBe('git merge --no-ff release/0.1.0');
      expect(callback.mock.calls[2][0]).toBe("git tag -a -m '' v0.1.0");
      expect(callback.mock.calls[3][0]).toBe('git checkout develop');
      expect(callback.mock.calls[4][0]).toBe('git merge --no-ff release/0.1.0');
    });
  });
});
